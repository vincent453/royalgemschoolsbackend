export const validateIncome = (req, res, next) => {
  const { amount } = req.body;
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return res.status(400).json({ message: "Invalid or missing 'amount'" });
  }
  next();
};

export const validateExpense = (req, res, next) => {
  const { amount } = req.body;
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return res.status(400).json({ message: "Invalid or missing 'amount'" });
  }
  next();
};
