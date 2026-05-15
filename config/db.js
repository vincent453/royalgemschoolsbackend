// config/db.js
import mongoose from "mongoose";

// Cache the connection so Vercel's serverless functions
// reuse it across warm invocations instead of reconnecting every request.
let cached = global._mongooseConnection;

if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI)
      .then((mongoose) => {
        console.log("✅ MongoDB Connected...");
        return mongoose;
      })
      .catch((error) => {
        cached.promise = null; // allow retry on next request
        console.error("❌ MongoDB Connection Failed:", error.message);
        throw error; // let the route handler return a 500 — don't kill the process
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;