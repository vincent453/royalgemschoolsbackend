import express from "express";
import multer  from "multer";
import { protect, protectStaffAdmin, protectInventory } from "../middleware/authMiddleware.js";
import { protectPortal }              from "../middleware/portalMiddleware.js";
import {
  getShopDashboard, getCategories, createCategory, updateCategory, deleteCategory,
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  getPublicProducts, getSalesReport,
} from "../controllers/Shopcontroller.js";
import {
  getOrders, getOrder, updateOrderStatus,
  placeOrder, initializeShopPayment,
  getMyOrders, getCustomers,
} from "../controllers/OrderContoller.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
});

// NOTE: the Paystack webhook for shop payments has moved to the
// unified endpoint at /api/webhooks/paystack (see routes/paystackWebhookRoutes.js).

// ── Public shop (parent portal — no auth needed for browsing) ─
router.get("/public/products", getPublicProducts);
router.get("/public/categories", getCategories);

// ── Portal (authenticated student/parent) ─────────────────────
router.post("/orders",                    protectPortal, placeOrder);
router.post("/orders/:id/pay",            protectPortal, initializeShopPayment);
router.get( "/my-orders",                 protectPortal, getMyOrders);

// ── Admin-only: revenue/customer visibility ────────────────────
// Kept on protectStaffAdmin (super_admin + admin only) — inventory
// managers should not see revenue figures or customer spending.
router.get("/dashboard", protectStaffAdmin, getShopDashboard);
router.get("/report",    protectStaffAdmin, getSalesReport);
router.get("/customers", protectStaffAdmin, getCustomers);

// ── Categories — day-to-day shop management ────────────────────
// protectInventory allows super_admin + admin + inventory_manager
router.get(   "/categories",     protectInventory, getCategories);
router.post(  "/categories",     protectInventory, upload.single("image"), createCategory);
router.put(   "/categories/:id", protectInventory, upload.single("image"), updateCategory);
router.delete("/categories/:id", protect,           deleteCategory); // destructive — super admin only

// ── Products — day-to-day shop management ──────────────────────
router.get(   "/products",     protectInventory, getProducts);
router.post(  "/products",     protectInventory, upload.array("images", 5), createProduct);
router.get(   "/products/:id", protectInventory, getProduct);
router.put(   "/products/:id", protectInventory, upload.array("images", 5), updateProduct);
router.delete("/products/:id", protect,           deleteProduct); // destructive — super admin only

// ── Orders — fulfillment ─────────────────────────────────────────
router.get(   "/orders",             protectInventory, getOrders);
router.get(   "/orders/:id",         protectInventory, getOrder);
router.patch( "/orders/:id/status",  protectInventory, updateOrderStatus);

export default router;