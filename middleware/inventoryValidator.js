export const validateInventory = (req, res, next) => {
  const {
    itemName,
    category,
    quantity,
    minimumStock,
    purchasePrice,
    sellingPrice,
  } = req.body;

  if (!itemName || itemName.trim() === "") {
    return res.status(400).json({
      message: "Item name is required",
    });
  }

  if (!category || category.trim() === "") {
    return res.status(400).json({
      message: "Category is required",
    });
  }

  if (quantity !== undefined && Number(quantity) < 0) {
    return res.status(400).json({
      message: "Quantity cannot be negative",
    });
  }

  if (minimumStock !== undefined && Number(minimumStock) < 0) {
    return res.status(400).json({
      message: "Minimum stock cannot be negative",
    });
  }

  if (purchasePrice !== undefined && Number(purchasePrice) < 0) {
    return res.status(400).json({
      message: "Purchase price cannot be negative",
    });
  }

  if (sellingPrice !== undefined && Number(sellingPrice) < 0) {
    return res.status(400).json({
      message: "Selling price cannot be negative",
    });
  }

  next();
};I