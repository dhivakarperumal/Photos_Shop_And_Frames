const orderModule = require("../modules/orderModule");

const getOrders = async (req, res) => {
  try {
    return res.status(200).json({ success: true, data: await orderModule.getOrders() });
  } catch (error) {
    console.error("Get orders error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to get orders" });
  }
};

const createOrder = async (req, res) => {
  try {
    const { order, items, address } = req.body;
    if (!order || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ success: false, message: "Order and at least one item are required" });
    }

    const result = await orderModule.createOrder(order, items, address);
    return res.status(201).json({ success: true, message: "Order created successfully", data: result });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to create order" });
  }
};

module.exports = { createOrder, getOrders };
