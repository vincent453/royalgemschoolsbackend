import crypto from "crypto";
import { processShopCharge } from "./OrderContoller.js";
import { processFeeCharge }  from "./feeController.js";

// ─────────────────────────────────────────────────────────────
// UNIFIED PAYSTACK WEBHOOK
// POST /api/webhooks/paystack
//
// Paystack only allows ONE webhook URL per mode (test/live) on your
// whole account — it is not per-route. This single endpoint verifies
// the signature once, then dispatches the event to the correct
// business logic (shop order vs fee statement) based on the
// metadata Paystack echoes back, with a reference-prefix fallback.
// ─────────────────────────────────────────────────────────────
export const paystackWebhook = async (req, res) => {
  try {
    console.log("[PAYSTACK-WEBHOOK] Received event");

    const signature = req.headers["x-paystack-signature"];
    const secret     = process.env.PAYSTACK_SECRET_KEY;

    const rawBody = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(JSON.stringify(req.body));

    console.log(
      "[PAYSTACK-WEBHOOK] isBuffer:", Buffer.isBuffer(req.body),
      "hasSecret:", !!secret
    );

    const hash = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    if (!signature || signature !== hash) {
      console.warn("[PAYSTACK-WEBHOOK] Invalid signature");
      return res.status(401).json({ message: "Invalid signature" });
    }

    const event = JSON.parse(rawBody.toString());
    console.log("[PAYSTACK-WEBHOOK] Event type:", event.event);

    if (event.event !== "charge.success") {
      return res.sendStatus(200);
    }

    const { reference, metadata } = event.data;
    console.log("[PAYSTACK-WEBHOOK] Reference:", reference, "Metadata:", metadata);

    // ── Dispatch by metadata first (most reliable), then by
    // reference prefix as a fallback ─────────────────────────
    const isShopPayment =
      !!metadata?.orderId || reference?.startsWith("SHOP-");
    const isFeePayment =
      !!metadata?.feeStatementId || reference?.startsWith("FEE-");

    if (isShopPayment) {
      console.log("[PAYSTACK-WEBHOOK] Routing to shop handler");
      await processShopCharge(event.data);
    } else if (isFeePayment) {
      console.log("[PAYSTACK-WEBHOOK] Routing to fee handler");
      await processFeeCharge(event.data);
    } else {
      console.warn(
        "[PAYSTACK-WEBHOOK] Could not determine payment type for reference:",
        reference
      );
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("[PAYSTACK-WEBHOOK] Critical error:", err.message);
    console.error("[PAYSTACK-WEBHOOK] Stack:", err.stack);
    // Still 200 so Paystack doesn't hammer retries — the error is logged above.
    return res.sendStatus(200);
  }
};