import dotenv from "dotenv";
dotenv.config();

import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import express from "express";
import cors from "cors";
import morgan from "morgan";

// Import API routes
import adminViewRoutes from "./routes/adminViewRoute.js";
import userRoutes from "./routes/userRoutes.js";
import connectDB from "./config/db.js";
import studentRoutes from "./routes/studentRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import settingsRoutes from "./routes/sethingRoutes.js";
import yearbookRoutes from "./routes/yearBook.js";
import authRoutes from "./routes/authRoutes.js";
import pinRoutes from "./routes/pinRoutes.js";
import blogRoutes from "./routes/blogRoutes.js"
import subjectAssignmentRoutes  from "./routes/subjectAssignmentRoutes.js";
import subjectResultRoutes      from "./routes/subjectResultRoutes.js";
import classSubjectConfigRoutes from "./routes/classSubjectConfigRoutes.js";
import accountingRoutes from "./routes/accountingRoutes.js";




const app = express();

// Middleware
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

// Connect to MongoDB (cached for serverless — safe to call on every request)
await connectDB();

// Webhook support for raw Paystack payloads
app.use("/api/fees/paystack/webhook", express.raw({ type: "application/json" }));

// API Routes
app.use("/api/blog", blogRoutes);
app.use("/api/users", userRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/yearbook", yearbookRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pins", pinRoutes);
app.use("/api/assignments",    subjectAssignmentRoutes);
app.use("/api/subject-results", subjectResultRoutes);
app.use("/api/class-config",   classSubjectConfigRoutes);
app.use("/api/accounting", accountingRoutes);
app.use("/api/fees", feeRoutes);



// VIEW Routes
app.use("/api/admin", adminViewRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Page not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Only start listening when running locally (not on Vercel)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

export default app;