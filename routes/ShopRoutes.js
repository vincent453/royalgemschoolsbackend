import express from "express";
import multer  from "multer";
import { protect, protectStaffAdmin } from "../middleware/authMiddleware.js";
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
// Paystack only supports one webhook URL per mode on the whole account,
// so shop and fee payments are now both handled there.

// ── Public shop (parent portal — no auth needed for browsing) ─
router.get("/public/products", getPublicProducts);
router.get("/public/categories", getCategories);

// ── Portal (authenticated student/parent) ─────────────────────
router.post("/orders",                    protectPortal, placeOrder);
router.post("/orders/:id/pay",            protectPortal, initializeShopPayment);
router.get( "/my-orders",                 protectPortal, getMyOrders);

// ── Admin dashboard & reports ─────────────────────────────────
router.get("/dashboard", protectStaffAdmin, getShopDashboard);
router.get("/report",    protectStaffAdmin, getSalesReport);
router.get("/customers", protectStaffAdmin, getCustomers);

// ── Categories ────────────────────────────────────────────────
router.get(   "/categories",     protectStaffAdmin, getCategories);
router.post(  "/categories",     protectStaffAdmin, upload.single("image"), createCategory);
router.put(   "/categories/:id", protectStaffAdmin, upload.single("image"), updateCategory);
router.delete("/categories/:id", protect,           deleteCategory);

// ── Products ──────────────────────────────────────────────────
router.get(   "/products",     protectStaffAdmin, getProducts);
router.post(  "/products",     protectStaffAdmin, upload.array("images", 5), createProduct);
router.get(   "/products/:id", protectStaffAdmin, getProduct);
router.put(   "/products/:id", protectStaffAdmin, upload.array("images", 5), updateProduct);
router.delete("/products/:id", protect,           deleteProduct);

// ── Orders ────────────────────────────────────────────────────
router.get(   "/orders",             protectStaffAdmin, getOrders);
router.get(   "/orders/:id",         protectStaffAdmin, getOrder);
router.patch( "/orders/:id/status",  protectStaffAdmin, updateOrderStatus);

export default router;