import dotenv from "dotenv";
import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import MongoStore from "connect-mongo";
import multer from "multer";

// Import API routes
  
// import userRoutes from "./routes/userRoutes.js";

// Import VIEW route
import adminViewRoutes from "../backend/routes/adminViewRoute.js";
import userRoutes from "./routes/userRoutes.js";
import connectDB from "./config/db.js";
import studentRoutes from "./routes/studentRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

// MongoDB URI
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/myDatabase';

// Session middleware with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: uri }),
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));


// API Routes


app.use("/api/users", userRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/results", resultRoutes);

// VIEW Routes
app.use("/api/admin", adminViewRoutes);
// app.use("/user", userViewRoutes);


// Connect to MongoDB

await connectDB();

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
    error:
      process.env.NODE_ENV === "development"
        ? err.stack
        : undefined,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));