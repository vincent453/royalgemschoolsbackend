import crypto from "crypto";
import FeeStatement from "../models/feeStatementModel.js";
import FeePayment from "../models/feePaymentModel.js";
import Student from "../models/studentModel.js";
import Income  from "../models/incomeModel.js";

const buildReference = () => {
  return `FEE-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
};

const buildStatus = (amountDue, amountPaid) => {
  const balance = Math.max(0, amountDue - amountPaid);
  if (balance <= 0) return { status: "paid", balance: 0 };
  if (amountPaid > 0) return { status: "partial", balance };
  return { status: "pending", balance };
};

export const createFeeStatement = async (req, res) => {
  try {
    const { studentId, classLevel, session, term, description, dueDate, items } = req.body;

    if (!studentId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "studentId and at least one fee item are required" });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const normalizedItems = items.map((item) => ({
      title:       item.title?.trim() || "Fee item",
      description: item.description?.trim() || "",
      amount:      Number(item.amount) || 0,
    }));

    const amountDue = normalizedItems.reduce((sum, item) => sum + item.amount, 0);
    const { status, balance } = buildStatus(amountDue, 0);

    const feeStatement = await FeeStatement.create({
      student:     student._id,
      classLevel:  classLevel || student.classLevel,
      session:     session    || student.session,
      term:        term       || "Term 1",
      reference:   buildReference(),
      description: description?.trim() || "",
      dueDate:     dueDate ? new Date(dueDate) : new Date(),
      items:       normalizedItems,
      amountDue,
      amountPaid:  0,
      balance,
      status,
      createdBy:   req.admin?._id || req.user?._id,
    });

    res.status(201).json(feeStatement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const getFeeStatements = async (req, res) => {
  try {
    const filter = {};
    const { student, classLevel, status, session, term } = req.query;

    if (student)    filter.student    = student;
    if (classLevel) filter.classLevel = classLevel;
    if (status)     filter.status     = status;
    if (session)    filter.session    = session;
    if (term)       filter.term       = term;

    const statements = await FeeStatement.find(filter)
      .populate("student", "firstName lastName regNumber classLevel session")
      .populate({ path: "payments", select: "amount status paystackReference paidAt" })
      .sort({ dueDate: 1, createdAt: -1 });

    res.json(statements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const getFeeStatementById = async (req, res) => {
  try {
    const statement = await FeeStatement.findById(req.params.id)
      .populate("student", "firstName lastName regNumber classLevel session parentEmail parentPhone")
      .populate({ path: "payments", select: "amount status reference paystackReference paidAt gatewayResponse" });

    if (!statement) return res.status(404).json({ message: "Fee statement not found" });

    if (req.studentId && String(statement.student._id) !== String(req.studentId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(statement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const updateFeeStatement = async (req, res) => {
  try {
    const statement = await FeeStatement.findById(req.params.id);
    if (!statement) return res.status(404).json({ message: "Fee statement not found" });

    const { classLevel, session, term, description, dueDate, items } = req.body;

    if (classLevel)            statement.classLevel  = classLevel;
    if (session)               statement.session     = session;
    if (term)                  statement.term        = term;
    if (description !== undefined) statement.description = description.trim();
    if (dueDate)               statement.dueDate     = new Date(dueDate);

    if (Array.isArray(items) && items.length > 0) {
      statement.items = items.map((item) => ({
        title:       item.title?.trim() || "Fee item",
        description: item.description?.trim() || "",
        amount:      Number(item.amount) || 0,
      }));
      statement.amountDue = statement.items.reduce((sum, item) => sum + item.amount, 0);
    }

    const statusInfo     = buildStatus(statement.amountDue, statement.amountPaid);
    statement.balance    = statusInfo.balance;
    statement.status     = statusInfo.status;

    await statement.save();
    res.json(statement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteFeeStatement = async (req, res) => {
  try {
    const statement = await FeeStatement.findByIdAndDelete(req.params.id);
    if (!statement) return res.status(404).json({ message: "Fee statement not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const getMyFeeStatements = async (req, res) => {
  try {
    const statements = await FeeStatement.find({ student: req.studentId })
      .populate("payments", "amount status reference paystackReference paidAt")
      .sort({ dueDate: 1, createdAt: -1 });
    res.json(statements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const initializePaystackPayment = async (req, res) => {
  try {
    const { feeStatementId } = req.body;
    if (!feeStatementId) return res.status(400).json({ message: "feeStatementId is required" });

    const statement = await FeeStatement.findById(feeStatementId).populate("student");
    if (!statement) return res.status(404).json({ message: "Fee statement not found" });

    if (String(statement.student._id) !== String(req.studentId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (statement.balance <= 0) {
      return res.status(400).json({ message: "There is no outstanding balance on this fee statement." });
    }

    const amountInKobo = Math.round(statement.balance * 100);
    const email        = statement.student.parentEmail || "no-reply@royalgem.edu.ng";
    const reference    = buildReference();

    const payload = {
      email,
      amount:   amountInKobo,
      currency: "NGN",
      reference,
      callback_url: `${process.env.FRONTEND_URL}/portal/fees?status=success`,
      metadata: {
        feeStatementId: statement._id.toString(),
        studentId:      statement.student._id.toString(),
      },
    };

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!data.status) {
      return res.status(502).json({ message: data.message || "Failed to initialize payment" });
    }

    const payment = await FeePayment.create({
      feeStatement:      statement._id,
      student:           statement.student._id,
      amount:            statement.balance,
      reference,
      gateway:           "paystack",
      status:            "pending",
      accessCode:        data.data.access_code,
      authorizationUrl:  data.data.authorization_url,
      paystackReference: data.data.reference,
      metadata:          payload.metadata,
    });

    statement.payments.push(payment._id);
    await statement.save();

    res.json({
      authorizationUrl: data.data.authorization_url,
      accessCode:       data.data.access_code,
      reference:        data.data.reference,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const handlePaystackWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-paystack-signature"];
    const secret    = process.env.PAYSTACK_SECRET_KEY;

    // express.raw() puts the raw Buffer into req.body — use it directly.
    // req.rawBody is NOT available here because express.json() is skipped
    // for this route. Buffer.isBuffer check handles both cases safely.
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(JSON.stringify(req.body));

    const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");

    if (!signature || signature !== hash) {
      console.warn("⚠️  Paystack webhook: invalid signature — possible spoofed request");
      return res.status(401).json({ message: "Invalid Paystack signature." });
    }

    // Parse the raw buffer into the event object
    const event = JSON.parse(rawBody.toString());

    if (event.event === "charge.success") {
      const { reference, amount, status, gateway_response } = event.data;

      const payment = await FeePayment.findOne({ reference });
      if (payment && payment.status !== "success") {
        payment.status          = status === "success" ? "success" : "failed";
        payment.transactionId   = event.data.id?.toString();
        payment.gatewayResponse = gateway_response || "";
        payment.paidAt          = new Date();
        await payment.save();

        const statement = await FeeStatement.findById(payment.feeStatement);
        if (statement) {
          const paidAmount     = Number(amount) / 100; // kobo → naira
          statement.amountPaid = Math.max(0, (statement.amountPaid || 0) + paidAmount);
          const statusInfo     = buildStatus(statement.amountDue, statement.amountPaid);
          statement.balance    = statusInfo.balance;
          statement.status     = statusInfo.status;
          await statement.save();
          console.log(`✅ Fee ${statement._id} updated to "${statement.status}" after webhook`);

          // ── Auto-create Income record ──────────────────────────────
          // Avoid duplicates — check if an income record already exists
          // for this payment reference before creating a new one
          const existingIncome = await Income.findOne({ reference });
          if (!existingIncome) {
            await Income.create({
              title:       `School Fees — ${statement.term} ${statement.session}`,
              amount:      paidAmount,
              category:    "School Fees",
              source:      "Paystack",
              student:     statement.student,
              date:        new Date(),
              session:     statement.session,
              term:        statement.term,
              description: `Auto-recorded from Paystack payment. Fee Ref: ${statement.reference}`,
              reference,
              recordedBy:  statement.createdBy, // the admin who created the fee statement
            });
            console.log(`💰 Income auto-created for fee ${statement._id}`);
          }
        }
      }
    }

    // Always respond 200 — Paystack retries if it doesn't get a 200
    return res.json({ status: true });
  } catch (err) {
    console.error("Webhook error:", err);
    // Still return 200 so Paystack doesn't keep retrying
    return res.status(200).json({ status: true });
  }
};