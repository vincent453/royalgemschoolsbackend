import express from "express";
import {
  addIncome, editIncome, deleteIncome, listIncome,
  addExpense, editExpense, deleteExpense, listExpenses,
  dashboardSummary,
} from "../controllers/accountingController.js";

const router = express.Router();

// Income
router.post("/incomes", addIncome);
router.get("/incomes", listIncome);
router.get("/incomes/:id", async (req, res) => {
  // simple fetch
  try {
    const Income = (await import("../models/incomeModel.js")).default;
    const doc = await Income.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.put("/incomes/:id", editIncome);
router.delete("/incomes/:id", deleteIncome);

// Expense
router.post("/expenses", addExpense);
router.get("/expenses", listExpenses);
router.get("/expenses/:id", async (req, res) => {
  try {
    const Expense = (await import("../models/expenseModel.js")).default;
    const doc = await Expense.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.put("/expenses/:id", editExpense);
router.delete("/expenses/:id", deleteExpense);

// Dashboard summary
router.get("/summary", dashboardSummary);

export default router;
