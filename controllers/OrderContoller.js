import crypto       from "crypto";
import Order         from "../models/Ordermodel.js";
import Product       from "../models/productModel.js";
import Inventory     from "../models/inventoryModel.js";
import StockMovement from "../models/stockMovementModel.js";
import Income        from "../models/incomeModel.js";

const fmt = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

// ─────────────────────────────────────────────────────────────
// GET ORDERS (admin)
// ─────────────────────────────────────────────────────────────
export const getOrders = async (req, res) => {
  try {
    const { orderStatus, paymentStatus, customer, startDate, endDate, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (orderStatus)   filter.orderStatus   = orderStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (customer)      filter["customer.name"] = new RegExp(customer, "i");
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate)   filter.createdAt.$lte = new Date(endDate);
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate("items.product", "productName images productCode")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product",  "productName images productCode category")
      .populate("incomeRecord",   "amount date reference");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE ORDER STATUS (admin)
// PATCH /api/shop/orders/:id/status
// ─────────────────────────────────────────────────────────────
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.orderStatus = orderStatus;
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PLACE ORDER (parent portal)
// POST /api/shop/orders
// ─────────────────────────────────────────────────────────────
export const placeOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, phone, notes, paymentMethod = "paystack" } = req.body;

    if (!items?.length) return res.status(400).json({ message: "No items in order" });

    // Validate stock and build items
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId)
        .populate("inventoryItem", "quantity minimumStock status itemName");

      if (!product) return res.status(404).json({ message: `Product not found: ${item.productId}` });
      if (product.status !== "Active") return res.status(400).json({ message: `${product.productName} is not available` });

      // Stock check from linked inventory
      const availableQty = product.inventoryItem?.quantity ?? 0;
      if (availableQty < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.productName}. Available: ${availableQty}`,
        });
      }

      const unitPrice = product.discountPrice ?? product.price;
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      orderItems.push({
        product:     product._id,
        productName: product.productName,
        productCode: product.productCode,
        image:       product.images?.[0] ?? null,
        quantity:    item.quantity,
        unitPrice,
        subtotal:    lineTotal,
      });
    }

    const deliveryFee = 0; // extend later
    const total       = subtotal + deliveryFee;

    const order = await Order.create({
      customer: {
        studentId: req.studentId,
        name:      req.body.customerName || "Portal Customer",
        email:     req.body.customerEmail || "",
        phone:     phone || "",
      },
      items:           orderItems,
      subtotal,
      deliveryFee,
      total,
      deliveryAddress: deliveryAddress || "",
      notes:           notes           || "",
      paymentMethod,
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// INITIALIZE PAYSTACK (parent portal)
// POST /api/shop/orders/:id/pay
// ─────────────────────────────────────────────────────────────
export const initializeShopPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order already paid" });
    }
    if (String(order.customer.studentId) !== String(req.studentId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // ── Reuse an existing in-flight reference instead of minting a
    // new one every time this endpoint is hit. Overwriting
    // paystackReference on every call orphans any Paystack checkout
    // session the student already opened with the old reference —
    // if they pay through that older session, the webhook can never
    // find the order because the field has since changed underneath it.
    let reference = order.paystackReference;

    if (!reference) {
      reference = `SHOP-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      order.paystackReference = reference;
      await order.save();
    }

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email:        order.customer.email || "shop@royalgem.edu.ng",
        amount:       Math.round(order.total * 100), // kobo
        reference,
        callback_url: `${process.env.FRONTEND_URL}/portal/shop/orders/${order._id}?status=success`,
        metadata: {
          orderId:     order._id.toString(),
          studentId:   req.studentId,
          orderNumber: order.orderNumber,
        },
      }),
    });

    const data = await response.json();
    if (!data.status) throw new Error(data.message || "Paystack initialization failed");

    res.json({ authorizationUrl: data.data.authorization_url, reference });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PAYSTACK WEBHOOK — handles shop payments
// POST /api/shop/webhook
// ─────────────────────────────────────────────────────────────
export const shopWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-paystack-signature"];
    const rawBody   = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(JSON.stringify(req.body));

    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest("hex");

    if (!signature || signature !== hash) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    const event = JSON.parse(rawBody.toString());
    if (event.event !== "charge.success") return res.sendStatus(200);

    const { reference, amount, metadata } = event.data;

    // ── Primary lookup: by the reference stored on the order.
    let order = await Order.findOne({ paystackReference: reference });

    // ── Fallback: if the reference was ever overwritten (e.g. by a
    // duplicate initialize call before this fix), Paystack still
    // echoes back the metadata we originally sent, so we can recover
    // the correct order via orderId instead of silently dropping the
    // payment.
    if (!order && metadata?.orderId) {
      order = await Order.findById(metadata.orderId);
      if (order) {
        console.warn(
          `[SHOP-WEBHOOK] Reference mismatch for order ${order._id}. ` +
          `Expected via metadata.orderId, stored paystackReference was "${order.paystackReference}", ` +
          `webhook reference was "${reference}". Recovered via metadata fallback.`
        );
      }
    }

    if (!order || order.paymentStatus === "paid") return res.sendStatus(200);

    // ── 1. Mark order as paid ──────────────────────────────
    order.paymentStatus    = "paid";
    order.orderStatus      = "processing";
    order.paidAt           = new Date();
    order.paystackResponse = event.data;
    order.receiptNumber    = `RCPT-${Date.now()}`;
    // Keep the reference that actually cleared, so future lookups are consistent.
    order.paystackReference = reference;
    await order.save();

    // ── 2. For each item: reduce inventory + stock movement ──
    for (const item of order.items) {
      const product = await Product.findById(item.product).populate("inventoryItem");
      if (!product?.inventoryItem) continue;

      const inv = await Inventory.findById(product.inventoryItem._id);
      if (!inv) continue;

      const newQty = Math.max(0, (inv.quantity || 0) - item.quantity);
      inv.quantity  = newQty;

      if (newQty <= 0)                     inv.status = "Out of Stock";
      else if (newQty <= inv.minimumStock) inv.status = "Low Stock";
      else                                  inv.status = "In Stock";

      await inv.save();

      await StockMovement.create({
        item:         inv._id,
        type:         "stock-out",
        quantity:     item.quantity,
        balanceAfter: newQty,
        reason:       `School Shop Order — ${order.orderNumber}`,
        reference:    order.orderNumber,
        performedBy:  order.customer.studentId,
      }).catch(err => console.error("StockMovement create error:", err));

      await Product.findByIdAndUpdate(product._id, {
        $inc: { totalSold: item.quantity, totalRevenue: item.subtotal },
        status: newQty <= 0 ? "Out of Stock" : "Active",
      });
    }

    // ── 3. Auto-create Income entry ────────────────────────
    const income = await Income.create({
      title:       `School Shop — Order ${order.orderNumber}`,
      amount:      Number(amount) / 100,
      category:    "Sales",
      source:      "School Shop",
      date:        new Date(),
      description: `Online shop payment from ${order.customer.name}. Items: ${order.items.map(i => i.productName).join(", ")}`,
      reference,
      recordedBy:  null,
    }).catch(err => console.error("Income create error:", err));

    if (income) {
      order.incomeRecord = income._id;
      await order.save();
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("Shop webhook error:", err);
    return res.sendStatus(200);
  }
};

// ─────────────────────────────────────────────────────────────
// MY ORDERS (parent portal)
// GET /api/shop/my-orders
// ─────────────────────────────────────────────────────────────
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ "customer.studentId": req.studentId })
      .populate("items.product", "productName images")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// CUSTOMERS (admin)
// GET /api/shop/customers
// ─────────────────────────────────────────────────────────────
export const getCustomers = async (req, res) => {
  try {
    const customers = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: {
          _id:          "$customer.studentId",
          name:         { $first: "$customer.name" },
          email:        { $first: "$customer.email" },
          phone:        { $first: "$customer.phone" },
          totalOrders:  { $sum: 1 },
          totalSpent:   { $sum: "$total" },
          lastPurchase: { $max: "$paidAt" },
        },
      },
      { $sort: { totalSpent: -1 } },
    ]);
    res.json({ success: true, customers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};