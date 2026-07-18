import express from "express";
import { paystackWebhook } from "../controllers/paystackWebhookController.js";

const router = express.Router();

// Raw body is required here — Paystack's HMAC signature is computed
// against the exact raw bytes of the request, not a re-serialized
// JSON object. Must stay the ONLY body-parsing middleware on this path.
router.post("/paystack", express.raw({ type: "application/json" }), paystackWebhook);

export default router;