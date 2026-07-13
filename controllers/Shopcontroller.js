import { v2 as cloudinary } from "cloudinary";
import Product         from "../models/";
import ProductCategory from "../models/Productcategorymodel.js";
import Order           from "../models/Ordermodel.js";
import Inventory       from "../../models/inventoryModel.js";

const uploadToCloudinary = (buffer) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "shop_products" }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(buffer);
  });
};

// ─────────────────────────────────────────────────────────────
// DASHBOARD
// GET /api/shop/dashboard
// ─────────────────────────────────────────────────────────────
export const getShopDashboard = async (req, res) => {
  try {
    const now        = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalProducts,
      activeProducts,
      outOfStock,
      totalOrders,
      pendingOrders,
      completedOrders,
      salesAgg,
      monthlySalesAgg,
      recentOrders,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ status: "Active" }),
      Product.countDocuments({ status: "Out of Stock" }),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: "pending" }),
      Order.countDocuments({ orderStatus: "delivered" }),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: "paid", paidAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.find()
        .populate("items.product", "productName images")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.json({
      success: true,
      stats: {
        totalProducts,
        activeProducts,
        outOfStock,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalSales:   salesAgg[0]?.total        ?? 0,
        monthlySales: monthlySalesAgg[0]?.total ?? 0,
      },
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// CATEGORIES — CRUD
// ─────────────────────────────────────────────────────────────
export const getCategories = async (req, res) => {
  try {
    const cats = await ProductCategory.find().sort({ sortOrder: 1, name: 1 });
    res.json(cats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, sortOrder } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Category name is required" });

    let image = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      image = result.secure_url;
    }

    const cat = await ProductCategory.create({
      name: name.trim(),
      description: description?.trim() ?? "",
      sortOrder: Number(sortOrder) || 0,
      image,
      createdBy: req.admin._id,
    });
    res.status(201).json(cat);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Category name already exists" });
    res.status(500).json({ message: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const cat = await ProductCategory.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: "Category not found" });

    const allowed = ["name", "description", "isActive", "sortOrder"];
    allowed.forEach(k => { if (req.body[k] !== undefined) cat[k] = req.body[k]; });

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      cat.image = result.secure_url;
    }

    await cat.save();
    res.json(cat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const inUse = await Product.countDocuments({ category: req.params.id });
    if (inUse) return res.status(400).json({ message: `Cannot delete — ${inUse} product(s) use this category` });
    await ProductCategory.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PRODUCTS — CRUD
// ─────────────────────────────────────────────────────────────
export const getProducts = async (req, res) => {
  try {
    const { category, status, featured, search, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (category)  filter.category  = category;
    if (status)    filter.status    = status;
    if (featured)  filter.isFeatured = featured === "true";
    if (search)    filter.$text     = { $search: search };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .populate("category",      "name slug")
      .populate("inventoryItem", "quantity minimumStock status itemName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category",      "name slug")
      .populate("inventoryItem", "quantity minimumStock status itemName location");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      productName, category, description, shortDescription,
      price, discountPrice, costPrice, sku, brand, weight,
      tags, isFeatured, status, inventoryItem,
    } = req.body;

    if (!productName?.trim()) return res.status(400).json({ message: "Product name is required" });
    if (!category)            return res.status(400).json({ message: "Category is required" });
    if (!price)               return res.status(400).json({ message: "Price is required" });

    // Upload multiple images
    let images = [];
    if (req.files?.length) {
      const uploads = await Promise.all(req.files.map(f => uploadToCloudinary(f.buffer)));
      images = uploads.map(u => u.secure_url);
    }

    const product = await Product.create({
      productName:      productName.trim(),
      category,
      description:      description?.trim()      ?? "",
      shortDescription: shortDescription?.trim() ?? "",
      price:            Number(price),
      discountPrice:    discountPrice ? Number(discountPrice) : null,
      costPrice:        Number(costPrice) || 0,
      sku:              sku?.trim()   ?? "",
      brand:            brand?.trim() ?? "",
      weight:           Number(weight) || 0,
      tags:             tags ? (Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim())) : [],
      isFeatured:       isFeatured === "true" || isFeatured === true,
      status:           status ?? "Active",
      inventoryItem:    inventoryItem || null,
      images,
      createdBy:        req.admin._id,
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const allowed = [
      "productName","category","description","shortDescription",
      "price","discountPrice","costPrice","sku","brand","weight",
      "tags","isFeatured","status","inventoryItem",
    ];
    allowed.forEach(k => { if (req.body[k] !== undefined) product[k] = req.body[k]; });

    if (req.files?.length) {
      const uploads = await Promise.all(req.files.map(f => uploadToCloudinary(f.buffer)));
      product.images = [...product.images, ...uploads.map(u => u.secure_url)];
    }

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const orders = await Order.countDocuments({ "items.product": req.params.id });
    if (orders) return res.status(400).json({ message: `Cannot delete — product has ${orders} order(s)` });
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PUBLIC SHOP — for parent portal
// GET /api/shop/public/products
// ─────────────────────────────────────────────────────────────
export const getPublicProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 24 } = req.query;
    const filter = { status: "Active" };
    if (category) filter.category = category;
    if (search)   filter.$text    = { $search: search };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .populate("category",      "name slug")
      .populate("inventoryItem", "quantity minimumStock status")
      .select("-costPrice -createdBy")
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// SALES REPORT
// GET /api/shop/report
// ─────────────────────────────────────────────────────────────
export const getSalesReport = async (req, res) => {
  try {
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const week  = new Date(today); week.setDate(week.getDate() - 7);
    const month = new Date(now.getFullYear(), now.getMonth(), 1);
    const year  = new Date(now.getFullYear(), 0, 1);

    const salesByPeriod = async (start) =>
      Order.aggregate([
        { $match: { paymentStatus: "paid", paidAt: { $gte: start } } },
        { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
      ]).then(r => ({ total: r[0]?.total ?? 0, count: r[0]?.count ?? 0 }));

    const [todaySales, weeklySales, monthlySales, yearlySales, topProducts, topCustomers] =
      await Promise.all([
        salesByPeriod(today),
        salesByPeriod(week),
        salesByPeriod(month),
        salesByPeriod(year),
        Product.find().sort({ totalSold: -1 }).limit(5).select("productName totalSold totalRevenue images"),
        Order.aggregate([
          { $match: { paymentStatus: "paid" } },
          { $group: {
              _id:        "$customer.studentId",
              name:       { $first: "$customer.name" },
              email:      { $first: "$customer.email" },
              totalSpent: { $sum: "$total" },
              orders:     { $sum: 1 },
            },
          },
          { $sort: { totalSpent: -1 } },
          { $limit: 5 },
        ]),
      ]);

    res.json({ success: true, todaySales, weeklySales, monthlySales, yearlySales, topProducts, topCustomers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};