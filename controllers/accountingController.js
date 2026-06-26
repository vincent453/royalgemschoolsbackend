import Income from "../models/incomeModel.js";
import Expense from "../models/expenseModel.js";
import mongoose from "mongoose";

const parseQuery = (query) => {
  const q = {};
  if (query.startDate || query.endDate) {
    q.date = {};
    if (query.startDate) q.date.$gte = new Date(query.startDate);
    if (query.endDate) q.date.$lte = new Date(query.endDate);
  }
  if (query.category) q.category = query.category;
  if (query.minAmount) q.amount = { ...(q.amount || {}), $gte: Number(query.minAmount) };
  if (query.maxAmount) q.amount = { ...(q.amount || {}), $lte: Number(query.maxAmount) };
  if (query.search) q.$or = [
    { description: { $regex: query.search, $options: "i" } },
    { source: { $regex: query.search, $options: "i" } },
    { vendor: { $regex: query.search, $options: "i" } },
  ];
  return q;
};

// Income handlers
export const addIncome = async (req, res) => {
  try {
    const income = await Income.create(req.body);
    res.status(201).json(income);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const editIncome = async (req, res) => {
  try {
    const income = await Income.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!income) return res.status(404).json({ message: "Income not found" });
    res.json(income);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findByIdAndDelete(req.params.id);
    if (!income) return res.status(404).json({ message: "Income not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const listIncome = async (req, res) => {
  try {
    const q = parseQuery(req.query);
    const incomes = await Income.find(q).sort({ date: -1 });
    res.json(incomes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Expense handlers
export const addExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const editExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const listExpenses = async (req, res) => {
  try {
    const q = parseQuery(req.query);
    const expenses = await Expense.find(q).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Dashboard summary
export const dashboardSummary = async (req, res) => {
  try {
    const now = new Date();
const startOfMonth = new Date(
  now.getUTCFullYear(),
  now.getUTCMonth(),
  1
);

const endOfMonth = new Date(
  now.getUTCFullYear(),
  now.getUTCMonth() + 1,
  1
);    const matchAll = {};

    const [incomeAgg] = await Income.aggregate([
      { $match: matchAll },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const [expenseAgg] = await Expense.aggregate([
      { $match: matchAll },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

const [incomeThisMonth] = await Income.aggregate([
  {
    $match: {
      date: {
        $gte: startOfMonth,
        $lt: endOfMonth,
      },
    },
  },
  {
    $group: {
      _id: null,
      total: { $sum: "$amount" },
    },
  },
]);

const [expenseThisMonth] = await Expense.aggregate([
  {
    $match: {
      date: {
        $gte: startOfMonth,
        $lt: endOfMonth,
      },
    },
  },
  {
    $group: {
      _id: null,
      total: { $sum: "$amount" },
    },
  },
]);
    const totalIncome = incomeAgg?.total || 0;
    const totalExpenses = expenseAgg?.total || 0;

    res.json({
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      incomeThisMonth: incomeThisMonth?.total || 0,
      expensesThisMonth: expenseThisMonth?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getLedger = async (req, res) => {
  try {
    const q = parseQuery(req.query);

    const [incomes, expenses] = await Promise.all([
      Income.find(q).lean().sort({ date: 1, createdAt: 1 }),
      Expense.find(q).lean().sort({ date: 1, createdAt: 1 }),
    ]);

    const entries = [
      ...incomes.map((item) => ({
        ...item,
        type: "Income",
        description: item.description || "Income received",
        label: item.source || item.category || "Income",
      })),
      ...expenses.map((item) => ({
        ...item,
        type: "Expense",
        description: item.description || "Expense paid",
        label: item.vendor || item.category || "Expense",
      })),
    ]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((item) => ({
        ...item,
        amount: Number(item.amount || 0),
      }));

    let runningBalance = 0;
    const ledgerEntries = entries.map((item) => {
      runningBalance += item.type === "Income" ? item.amount : -item.amount;
      return {
        ...item,
        runningBalance,
      };
    });

    const totalIncome = ledgerEntries.reduce((sum, entry) => sum + (entry.type === "Income" ? entry.amount : 0), 0);
    const totalExpenses = ledgerEntries.reduce((sum, entry) => sum + (entry.type === "Expense" ? entry.amount : 0), 0);

    res.json({
      entries: ledgerEntries.reverse(),
      totals: {
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Export for tests if needed
export default {
  addIncome, editIncome, deleteIncome, listIncome,
  addExpense, editExpense, deleteExpense, listExpenses,
  dashboardSummary, getLedger,
};
