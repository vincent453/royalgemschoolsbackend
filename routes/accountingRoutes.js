import express from "express";
import {
  addIncome, editIncome, deleteIncome, listIncome,
  addExpense, editExpense, deleteExpense, listExpenses,
  dashboardSummary, getLedger,
} from "../controllers/accountingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All accounting routes require admin auth
router.use(protect);

// ── Income ────────────────────────────────────────────────────
router.get   ("/incomes",     listIncome);
router.post  ("/incomes",     addIncome);
router.get   ("/incomes/:id", async (req, res) => {
  try {
    const Income = (await import("../models/incomeModel.js")).default;
    const doc = await Income.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.put   ("/incomes/:id", editIncome);
router.delete("/incomes/:id", deleteIncome);

// ── Expenses ──────────────────────────────────────────────────
router.get   ("/expenses",     listExpenses);
router.post  ("/expenses",     addExpense);
router.get   ("/expenses/:id", async (req, res) => {
  try {
    const Expense = (await import("../models/expenseModel.js")).default;
    const doc = await Expense.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.put   ("/expenses/:id", editExpense);
router.delete("/expenses/:id", deleteExpense);

// ── Dashboard summary ─────────────────────────────────────────
router.get("/summary", dashboardSummary);

// ── Ledger ────────────────────────────────────────────────────
// GET /api/accounting/ledger?search=&startDate=&endDate=&category=
router.get("/ledger", getLedger);

export default router;