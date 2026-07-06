import Inventory     from "../models/inventoryModel.js";
import StockMovement from "../models/stockMovementModel.js";
import Purchase      from "../models/purchaseModel.js";
import Supplier      from "../models/supplierModel.js";
import Expense       from "../models/expenseModel.js";

const PAGE = 20;
const actor = (req) => req.admin?._id || req.user?._id || null;

// ── helper: record a movement ─────────────────────────────────
const recordMovement = async ({ inventoryId, itemName, type, qty, before, after, reason, reference, performedBy }) => {
  await StockMovement.create({
    inventory:      inventoryId,
    itemName,
    type,
    quantity:       qty,
    quantityBefore: before,
    quantityAfter:  after,
    reason,
    reference,
    performedBy,
  });
};

// ── helper: recompute status ──────────────────────────────────
const computeStatus = (qty, min) => {
  if (qty <= 0)   return "Out of Stock";
  if (qty <= min) return "Low Stock";
  return "In Stock";
};

// ─────────────────────────────────────────────────────────────
// INVENTORY CRUD
// ─────────────────────────────────────────────────────────────
export const createInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.create({ ...req.body, createdBy: actor(req) });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllInventory = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = PAGE } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status)   filter.status   = status;
    if (search) {
      filter.$or = [
        { itemName:  { $regex: search, $options: "i" } },
        { itemCode:  { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip     = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Inventory.find(filter)
        .populate("supplier", "companyName contactPerson phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Inventory.countDocuments(filter),
    ]);

    res.json({ items, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getInventoryById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id)
      .populate("supplier", "companyName contactPerson phone email address")
      .populate("createdBy", "name");
    if (!item) return res.status(404).json({ message: "Item not found" });

    const [movements, purchases] = await Promise.all([
      StockMovement.find({ inventory: item._id }).sort({ createdAt: -1 }).limit(20),
      Purchase.find({ "items.inventory": item._id }).sort({ purchaseDate: -1 }).limit(10)
        .populate("supplier", "companyName").populate("purchasedBy", "name"),
    ]);

    res.json({ item, movements, purchases });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateInventoryItem = async (req, res) => {
  try {
    const { quantity, minimumStock, ...rest } = req.body;

    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Check if there are transactions before allowing delete-like operations
    Object.assign(item, rest);
    if (quantity  !== undefined) item.quantity      = Number(quantity);
    if (minimumStock !== undefined) item.minimumStock = Number(minimumStock);
    item.status = computeStatus(item.quantity, item.minimumStock);

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteInventoryItem = async (req, res) => {
  try {
    const hasMovements = await StockMovement.exists({ inventory: req.params.id });
    const hasPurchases = await Purchase.exists({ "items.inventory": req.params.id });
    if (hasMovements || hasPurchases) {
      return res.status(400).json({
        message: "Cannot delete — this item has transaction history. Deactivate it instead.",
      });
    }
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// STOCK MOVEMENTS
// ─────────────────────────────────────────────────────────────
export const stockIn = async (req, res) => {
  try {
    const { inventoryId, quantity, reason, reference } = req.body;
    const qty = Number(quantity);
    if (!qty || qty <= 0) return res.status(400).json({ message: "Quantity must be greater than 0" });

    const item = await Inventory.findById(inventoryId);
    if (!item) return res.status(404).json({ message: "Inventory item not found" });

    const before = item.quantity;
    item.quantity += qty;
    item.status    = computeStatus(item.quantity, item.minimumStock);
    await item.save();

    await recordMovement({
      inventoryId: item._id, itemName: item.itemName,
      type: "Stock In", qty, before, after: item.quantity,
      reason, reference, performedBy: actor(req),
    });

    res.json({ item, movement: { type: "Stock In", qty, before, after: item.quantity } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const stockOut = async (req, res) => {
  try {
    const { inventoryId, quantity, reason, reference } = req.body;
    const qty = Number(quantity);
    if (!qty || qty <= 0) return res.status(400).json({ message: "Quantity must be greater than 0" });

    const item = await Inventory.findById(inventoryId);
    if (!item) return res.status(404).json({ message: "Inventory item not found" });
    if (item.quantity < qty) {
      return res.status(400).json({ message: `Insufficient stock. Available: ${item.quantity}` });
    }

    const before = item.quantity;
    item.quantity -= qty;
    item.status    = computeStatus(item.quantity, item.minimumStock);
    await item.save();

    await recordMovement({
      inventoryId: item._id, itemName: item.itemName,
      type: "Stock Out", qty, before, after: item.quantity,
      reason, reference, performedBy: actor(req),
    });

    res.json({ item, movement: { type: "Stock Out", qty, before, after: item.quantity } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const adjustStock = async (req, res) => {
  try {
    const { inventoryId, quantity, type = "Adjustment", reason } = req.body;
    const newQty = Number(quantity);
    if (newQty < 0) return res.status(400).json({ message: "Quantity cannot be negative" });

    const item = await Inventory.findById(inventoryId);
    if (!item) return res.status(404).json({ message: "Inventory item not found" });

    const before = item.quantity;
    item.quantity = newQty;
    item.status   = computeStatus(item.quantity, item.minimumStock);
    await item.save();

    await recordMovement({
      inventoryId: item._id, itemName: item.itemName,
      type, qty: Math.abs(newQty - before), before, after: newQty,
      reason, reference: "", performedBy: actor(req),
    });

    res.json({ item, movement: { type, before, after: newQty } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PURCHASES
// ─────────────────────────────────────────────────────────────
export const recordPurchase = async (req, res) => {
  try {
    const { supplierId, items, invoiceNumber, purchaseDate, notes } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "At least one item is required" });
    }

    let totalAmount = 0;
    const purchaseItems = [];

    for (const line of items) {
      const inv = await Inventory.findById(line.inventoryId);
      if (!inv) return res.status(404).json({ message: `Item ${line.inventoryId} not found` });

      const qty       = Number(line.quantity);
      const unitPrice = Number(line.unitPrice);
      const totalCost = qty * unitPrice;
      totalAmount    += totalCost;

      // Increase inventory
      const before = inv.quantity;
      inv.quantity += qty;
      inv.status    = computeStatus(inv.quantity, inv.minimumStock);
      if (!inv.supplier && supplierId) inv.supplier = supplierId;
      await inv.save();

      await recordMovement({
        inventoryId: inv._id, itemName: inv.itemName,
        type: "Stock In", qty, before, after: inv.quantity,
        reason: `Purchase — ${invoiceNumber || "no invoice"}`,
        reference: invoiceNumber,
        performedBy: actor(req),
      });

      purchaseItems.push({
        inventory: inv._id,
        itemName:  inv.itemName,
        quantity:  qty,
        unitPrice,
        totalCost,
      });
    }

    // Auto-create Expense record
    const supplier = supplierId ? await Supplier.findById(supplierId) : null;
    const expense = await Expense.create({
      amount:      totalAmount,
      category:    "Inventory Purchase",
      vendor:      supplier?.companyName || "Unknown Supplier",
      date:        purchaseDate || new Date(),
      description: `Purchase — Invoice ${invoiceNumber || "N/A"}`,
      incurredBy:  actor(req),
    });

    const purchase = await Purchase.create({
      invoiceNumber: invoiceNumber || "",
      supplier:      supplierId || null,
      items:         purchaseItems,
      totalAmount,
      purchaseDate:  purchaseDate || new Date(),
      purchasedBy:   actor(req),
      notes:         notes || "",
      expenseRef:    expense._id,
    });

    res.status(201).json({ purchase, expense });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPurchases = async (req, res) => {
  try {
    const { page = 1, limit = PAGE } = req.query;
    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));

    const [purchases, total] = await Promise.all([
      Purchase.find()
        .populate("supplier", "companyName")
        .populate("purchasedBy", "name")
        .sort({ purchaseDate: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Purchase.countDocuments(),
    ]);

    res.json({ purchases, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// REPORTS
// ─────────────────────────────────────────────────────────────
export const getInventoryReport = async (req, res) => {
  try {
    const [
      totalItems,
      lowStock,
      outOfStock,
      valueAgg,
      recentMovements,
    ] = await Promise.all([
      Inventory.countDocuments(),
      Inventory.countDocuments({ status: "Low Stock" }),
      Inventory.countDocuments({ status: "Out of Stock" }),
      Inventory.aggregate([
        { $group: { _id: null, totalValue: { $sum: { $multiply: ["$quantity", "$purchasePrice"] } } } },
      ]),
      StockMovement.find().sort({ createdAt: -1 }).limit(10)
        .populate("inventory", "itemName itemCode"),
    ]);

    res.json({
      totalItems,
      lowStock,
      outOfStock,
      inStock:     totalItems - lowStock - outOfStock,
      totalValue:  valueAgg[0]?.totalValue || 0,
      recentMovements,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getLowStock = async (req, res) => {
  try {
    const items = await Inventory.find({ status: "Low Stock" })
      .populate("supplier", "companyName phone")
      .sort({ quantity: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOutOfStock = async (req, res) => {
  try {
    const items = await Inventory.find({ status: "Out of Stock" })
      .populate("supplier", "companyName phone")
      .sort({ itemName: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// SUPPLIERS
// ─────────────────────────────────────────────────────────────
export const createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ isActive: true }).sort({ companyName: 1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const inUse = await Inventory.exists({ supplier: req.params.id });
    if (inUse) return res.status(400).json({ message: "Supplier is linked to inventory items. Deactivate instead." });
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
