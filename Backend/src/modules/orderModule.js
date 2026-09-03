const { getDB } = require("../config/db");

const createOrder = async (orderData, items, address) => {
  const pool = getDB();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const datePart = new Date(orderData.order_date).toISOString().slice(0, 10).replace(/-/g, "");
    const [lastOrders] = await connection.query(
      "SELECT order_id FROM orders WHERE order_id LIKE ? ORDER BY id DESC LIMIT 1",
      [`ORD-${datePart}-%`]
    );
    const lastSequence = Number(lastOrders[0]?.order_id?.split("-").pop()) || 0;
    const orderId = `ORD-${datePart}-${String(lastSequence + 1).padStart(3, "0")}`;

    await connection.query(
      `INSERT INTO orders (order_id, customer_id, billing_type, order_date, total_items, subtotal, discount_amount, tax_amount, total_amount, payment_method, payment_status, order_status, notes, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, orderData.customer_id, orderData.billing_type, orderData.order_date, orderData.total_items, orderData.subtotal, orderData.discount_amount, orderData.tax_amount, orderData.total_amount, orderData.payment_method, orderData.payment_status, orderData.order_status, orderData.notes || "", orderData.created_by, orderData.updated_by]
    );

    if (items.length) {
      await connection.query(
        `INSERT INTO order_items (item_id, order_id, product_id, product_name, product_code, quantity, unit_price, discount, tax, total_price) VALUES ?`,
        [items.map((item, index) => [`${orderId}-ITEM${String(index + 1).padStart(3, "0")}`, orderId, item.product_id, item.product_name, item.product_code || null, item.quantity, item.unit_price, item.discount || 0, item.tax || 0, item.total_price])]
      );
    }

    if (address) {
      await connection.query(
        `INSERT INTO addresses (address_id, user_id, customer_id, order_id, address_type, customer_name, mobile_number, alternate_mobile, address_line1, address_line2, city, district, state, country, pincode, landmark, is_default, status, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [`ADD-${orderId}`, address.user_id, address.customer_id, orderId, "Billing", address.customer_name, address.mobile_number, address.alternate_mobile || "", address.address_line1 || address.address || "", address.address_line2 || "", address.city || "", address.district || "", address.state || "", address.country || "India", address.pincode || "", address.landmark || "", address.is_default ?? true, "Active", orderData.created_by, orderData.updated_by]
      );
    }

    await connection.commit();
    return { order_id: orderId, total_amount: orderData.total_amount };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getOrders = async () => {
  const pool = getDB();
  const [orders] = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
  return Promise.all(orders.map(async (order) => {
    const [items] = await pool.query("SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC", [order.order_id]);
    const [addresses] = await pool.query("SELECT * FROM addresses WHERE order_id = ? LIMIT 1", [order.order_id]);
    return { ...order, items, address: addresses[0] || null };
  }));
};

module.exports = { createOrder, getOrders };
