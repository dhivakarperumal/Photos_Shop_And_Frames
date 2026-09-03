const orderModule = require("../modules/orderModule");
const cartModule = require("../modules/cartModule");

const createOrder = async (req, res) => {
  try {
    const {
      user_id,
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      city,
      state,
      pincode,
      total_amount,
      payment_method,
      notes,
      items = [],
      clear_cart = false,
      // Legacy / billing format support
      order,
      address,
    } = req.body;

    // Handle legacy format if passed
    if (order && !customer_name) {
      const legacyResult = await orderModule.createOrder({
        orderData: {
          user_id: order.user_id || order.customer_id || null,
          billing_type: order.billing_type || "Shop Billing",
          customer_name: address?.customer_name || order.customer_name || "Customer",
          customer_email: order.customer_email || "",
          customer_phone: address?.mobile_number || order.customer_phone || "",
          shipping_address: [
            address?.door_number,
            address?.street_name,
            address?.landmark,
          ].filter(Boolean).join(", ") ||
            [address?.address_line1, address?.address_line2]
              .filter(Boolean)
              .join(", ") ||
            "Store Pickup",
          city: address?.city || "",
          state: address?.state || "",
          pincode: address?.pincode || "",
          total_amount: order.total_amount || 0,
          payment_method: order.payment_method || "Cash",
          payment_status: order.payment_status || "Pending",
          order_status: order.order_status || "Pending",
          notes: order.notes || null,
          created_by: order.created_by || order.user_id || order.customer_id || null,
          updated_by: order.updated_by || order.user_id || order.customer_id || null,
        },
        items: Array.isArray(items) ? items : [],
      });
      return res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: legacyResult,
      });
    }

    if (!customer_name || !customer_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }

    if (!customer_phone || !customer_phone.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer phone number is required",
      });
    }

    if (!shipping_address || !shipping_address.trim()) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    if (!items.length) {
      return res.status(400).json({
        success: false,
        message: "Order must include at least one item",
      });
    }

    const calculatedTotal =
      Number(total_amount) ||
      items.reduce(
        (acc, item) =>
          acc + Number(item.price || item.unit_price || 0) * Number(item.quantity || 1),
        0
      );

    const orderPayload = {
      user_id: user_id || req.user?.user_id || null,
      billing_type: "Online Order",
      customer_name: customer_name.trim(),
      customer_email: (customer_email || "").trim(),
      customer_phone: customer_phone.trim(),
      shipping_address: shipping_address.trim(),
      city: (city || "").trim(),
      state: (state || "").trim(),
      pincode: (pincode || "").trim(),
      total_amount: calculatedTotal,
      payment_method: payment_method || "Cash On Delivery",
      payment_status: payment_method === "Online" ? "Paid" : "Pending",
      order_status: "Pending",
      notes: notes || null,
      created_by: user_id || req.user?.user_id || null,
      updated_by: user_id || req.user?.user_id || null,
    };

    const newOrder = await orderModule.createOrder({
      orderData: orderPayload,
      items,
    });

    // Optionally clear user's cart if this order was placed from cart checkout
    if (clear_cart && user_id) {
      try {
        await cartModule.clearCart(user_id);
      } catch (err) {
        console.warn("Could not clear cart after order:", err.message);
      }
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: newOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to place order",
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { status, search, billing_type } = req.query;
    const orders = await orderModule.getAllOrders({ status, search, billing_type });

    res.status(200).json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve orders",
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderModule.getOrderById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve order details",
    });
  }
};

const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await orderModule.getOrdersByUser(userId);

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve user orders",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { order_status, payment_status } = req.body;

    const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (order_status && !validStatuses.includes(order_status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const updated = await orderModule.updateOrderStatus(orderId, {
      order_status,
      payment_status,
      updated_by: req.user?.user_id || req.body.updated_by || null,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Order not found or status unchanged",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update order status",
    });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const deleted = await orderModule.deleteOrder(orderId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete order",
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrders: getAllOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  deleteOrder,
};
