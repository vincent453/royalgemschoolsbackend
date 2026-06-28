import Income from "../models/incomeModel.js";
import Expense from "../models/expenseModel.js";

const parseQuery = (query) => {
  const q = {};
  if (query.startDate || query.endDate) {
    q.date = {};
    if (query.startDate) q.date.$gte = new Date(query.startDate);
    if (query.endDate)   q.date.$lte = new Date(query.endDate);
  }
  if (query.category)  q.category = query.category;
  if (query.minAmount) q.amount = { ...(q.amount || {}), $gte: Number(query.minAmount) };
  if (query.maxAmount) q.amount = { ...(q.amount || {}), $lte: Number(query.maxAmount) };
  if (query.search) q.$or = [
    { description: { $regex: query.search, $options: "i" } },
    { source:      { $regex: query.search, $options: "i" } },
    { vendor:      { $regex: query.search, $options: "i" } },
  ];
  return q;
};

// ── Income ────────────────────────────────────────────────────
export const addIncome = async (req, res) => {
  try {
    const income = await Income.create(req.body);
    res.status(201).json(income);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const editIncome = async (req, res) => {
  try {
    const income = await Income.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!income) return res.status(404).json({ message: "Income not found" });
    res.json(income);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findByIdAndDelete(req.params.id);
    if (!income) return res.status(404).json({ message: "Income not found" });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const listIncome = async (req, res) => {
  try {
    const incomes = await Income.find(parseQuery(req.query)).sort({ date: -1 });
    res.json(incomes);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Expenses ──────────────────────────────────────────────────
export const addExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json(expense);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const editExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const listExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find(parseQuery(req.query)).sort({ date: -1 });
    res.json(expenses);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Dashboard summary ─────────────────────────────────────────
export const dashboardSummary = async (req, res) => {
  try {
    const now          = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [[incomeAgg], [expenseAgg], [incomeMonth], [expenseMonth]] = await Promise.all([
      Income.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
      Expense.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
      Income.aggregate([{ $match: { date: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Expense.aggregate([{ $match: { date: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    ]);

    const totalIncome   = incomeAgg?.total   || 0;
    const totalExpenses = expenseAgg?.total  || 0;

    res.json({
      totalIncome,
      totalExpenses,
      netBalance:         totalIncome - totalExpenses,
      incomeThisMonth:    incomeMonth?.total  || 0,
      expensesThisMonth:  expenseMonth?.total || 0,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Ledger ────────────────────────────────────────────────────
// GET /api/accounting/ledger
// Returns all income + expense entries merged, sorted by date,
// with a running balance column.
// Query params: search, startDate, endDate, category
export const getLedger = async (req, res) => {
  try {
    const { search, startDate, endDate, category } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate)   dateFilter.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));

    // Build text search filter
    const textFilter = search
      ? {
          $or: [
            { description: { $regex: search, $options: "i" } },
            { source:      { $regex: search, $options: "i" } },
            { vendor:      { $regex: search, $options: "i" } },
            { category:    { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const categoryFilter = category ? { category } : {};

    const dateQ = Object.keys(dateFilter).length ? { date: dateFilter } : {};

    // Fetch both in parallel
    const [incomes, expenses] = await Promise.all([
      Income.find({ ...dateQ, ...textFilter, ...categoryFilter }).lean(),
      Expense.find({ ...dateQ, ...textFilter, ...categoryFilter }).lean(),
    ]);

    // Normalise into unified shape
    const incomeEntries  = incomes.map(i => ({
      _id:         i._id,
      date:        i.date,
      type:        "Income",
      category:    i.category  || "General",
      description: i.description || "",
      reference:   i.source    || i.receiptRef || "",
      amount:      i.amount,
      createdAt:   i.createdAt,
    }));

    const expenseEntries = expenses.map(e => ({
      _id:         e._id,
      date:        e.date,
      type:        "Expense",
      category:    e.category  || "General",
      description: e.description || "",
      reference:   e.vendor    || e.receiptRef || "",
      amount:      e.amount,
      createdAt:   e.createdAt,
    }));

    // Merge and sort by date ascending (for running balance), then reverse for display
    const merged = [...incomeEntries, ...expenseEntries]
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Compute running balance
    let balance = 0;
    const withBalance = merged.map(entry => {
      balance += entry.type === "Income" ? entry.amount : -entry.amount;
      return { ...entry, runningBalance: balance };
    });

    // Reverse so newest is first for display
    const entries = withBalance.reverse();

    // Summary
    const totalIncome   = incomeEntries.reduce((s, e) => s + e.amount, 0);
    const totalExpenses = expenseEntries.reduce((s, e) => s + e.amount, 0);

    res.json({
      entries,
      summary: {
        totalIncome,
        totalExpenses,
        netBalance:   totalIncome - totalExpenses,
        totalEntries: entries.length,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default {
  addIncome, editIncome, deleteIncome, listIncome,
  addExpense, editExpense, deleteExpense, listExpenses,
  dashboardSummary, getLedger,
};