import dotenv from "dotenv";
dotenv.config();

import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import express from "express";
import cors from "cors";
import morgan from "morgan";

// Import API routes
import adminViewRoutes          from "./routes/adminViewRoute.js";
import userRoutes               from "./routes/userRoutes.js";
import connectDB                from "./config/db.js";
import studentRoutes            from "./routes/studentRoutes.js";
import resultRoutes             from "./routes/resultRoutes.js";
import settingsRoutes           from "./routes/sethingRoutes.js";
import yearbookRoutes           from "./routes/yearBook.js";
import authRoutes               from "./routes/authRoutes.js";
import pinRoutes                from "./routes/pinRoutes.js";
import blogRoutes               from "./routes/blogRoutes.js";
import subjectAssignmentRoutes  from "./routes/subjectAssignmentRoutes.js";
import subjectResultRoutes      from "./routes/subjectResultRoutes.js";
import classSubjectConfigRoutes from "./routes/classSubjectConfigRoutes.js";
import accountingRoutes         from "./routes/accountingRoutes.js";
import feeRoutes                from "./routes/feeRoutes.js";
import receiptRoutes            from "./routes/receiptRoutes.js";
import attendanceRoutes         from "./routes/attendanceRoutes.js";
import supplierRoutes           from "./routes/suppliersRoutes.js";
import inventoryRoutes          from "./routes/inventoryRoutes.js";
import shopRoutes               from "./routes/ShopRoutes.js";
import paystackWebhookRoutes    from "./routes/paystackWebhookRoutes.js";


const app = express();


// ── Webhook raw body — MUST be before express.json() ─────────
// Paystack's signature is computed against the exact raw bytes of the
// request body. express.json() below would consume the stream and
// replace req.body with a parsed object, which breaks the raw-body
// middleware defined on the /api/webhooks/paystack route. So we skip
// global JSON parsing for that one path and let the route-level
// express.raw() in paystackWebhookRoutes.js handle it instead.
const PAYSTACK_WEBHOOK_PATH = "/api/webhooks/paystack";

app.use((req, res, next) => {
  if (req.originalUrl === PAYSTACK_WEBHOOK_PATH) return next();
  express.json()(req, res, next);
});

app.use((req, res, next) => {
  if (req.originalUrl === PAYSTACK_WEBHOOK_PATH) return next();
  express.urlencoded({ extended: true })(req, res, next);
});

app.use(cors());
app.use(morgan("dev"));

// ── Database ──────────────────────────────────────────────────
await connectDB();

// ── API Routes ────────────────────────────────────────────────
app.use("/api/blog",            blogRoutes);
app.use("/api/users",           userRoutes);
app.use("/api/students",        studentRoutes);
app.use("/api/results",         resultRoutes);
app.use("/api/settings",        settingsRoutes);
app.use("/api/yearbook",        yearbookRoutes);
app.use("/api/auth",            authRoutes);
app.use("/api/pins",            pinRoutes);
app.use("/api/assignments",     subjectAssignmentRoutes);
app.use("/api/subject-results", subjectResultRoutes);
app.use("/api/class-config",    classSubjectConfigRoutes);
app.use("/api/accounting",      accountingRoutes);
app.use("/api/fees",            feeRoutes);
app.use("/api/receipts",        receiptRoutes);
app.use("/api/attendance",      attendanceRoutes);
app.use("/api/suppliers",       supplierRoutes);
app.use("/api/inventory",       inventoryRoutes);
app.use("/api/shop",            shopRoutes);
app.use("/api/webhooks",        paystackWebhookRoutes);

// ── View Routes ───────────────────────────────────────────────
app.use("/api/admin", adminViewRoutes);

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Page not found",
  });
});

// ── Error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// ── Local server (not on Render/Vercel) ──────────────────────
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

export default app;