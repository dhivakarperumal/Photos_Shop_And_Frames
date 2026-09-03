const { getDB } = require("../config/db");

/**
 * Order Module
 * Manages orders and order_items with customer customized photos.
 */

const generateOrderId = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${dateStr}-${rand}`;
};

const createOrder = async ({ orderData, items = [] }) => {
  const pool = getDB();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const orderId = orderData.order_id || generateOrderId();

    const insertOrderQuery = `
      INSERT INTO orders (
        order_id,
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
        payment_status,
        order_status,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const orderValues = [
      orderId,
      orderData.user_id || null,
      orderData.customer_name,
      orderData.customer_email,
      orderData.customer_phone,
      orderData.shipping_address,
      orderData.city || "",
      orderData.state || "",
      orderData.pincode || "",
      Number(orderData.total_amount || 0),
      orderData.payment_method || "Cash On Delivery",
      orderData.payment_status || "Pending",
      orderData.order_status || "Pending",
      orderData.notes || null,
    ];

    const [orderResult] = await connection.query(insertOrderQuery, orderValues);

    const insertItemQuery = `
      INSERT INTO order_items (
        order_id,
        product_id,
        product_name,
        category,
        size,
        price,
        quantity,
        total_price,
        customization_id,
        slot_photos,
        product_image,
        frame_image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const item of items) {
      const itemValues = [
        orderId,
        Number(item.product_id),
        item.product_name || "Custom Frame Product",
        item.category || "Photo Frames",
        item.size || "Standard",
        Number(item.price || 0),
        Number(item.quantity || 1),
        Number(item.total_price || (item.price * (item.quantity || 1))),
        item.customization_id || null,
        item.slot_photos ? JSON.stringify(item.slot_photos) : null,
        item.product_image || null,
        item.frame_image || null,
      ];

      await connection.query(insertItemQuery, itemValues);
    }

    await connection.commit();

    return {
      id: orderResult.insertId,
      order_id: orderId,
      ...orderData,
      items,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getAllOrders = async (filters = {}) => {
  const pool = getDB();
  let query = `
    SELECT 
      o.*,
      COUNT(oi.id) AS item_count,
      GROUP_CONCAT(oi.product_name SEPARATOR ', ') AS product_names
    FROM orders o
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    WHERE 1=1
  `;
  const values = [];

  if (filters.status && filters.status !== "All" && filters.status !== "All Status") {
    query += ` AND o.order_status = ?`;
    values.push(filters.status);
  }

  if (filters.search) {
    query += ` AND (o.order_id LIKE ? OR o.customer_name LIKE ? OR o.customer_phone LIKE ? OR o.customer_email LIKE ?)`;
    const searchPattern = `%${filters.search}%`;
    values.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }

  query += ` GROUP BY o.id ORDER BY o.created_at DESC`;

  const [rows] = await pool.query(query, values);
  return rows;
};

const getOrderById = async (orderId) => {
  const pool = getDB();
  const isNumeric = !isNaN(orderId);

  const orderQuery = isNumeric
    ? `SELECT * FROM orders WHERE id = ? LIMIT 1`
    : `SELECT * FROM orders WHERE order_id = ? LIMIT 1`;

  const [orderRows] = await pool.query(orderQuery, [orderId]);

  if (!orderRows.length) return null;

  const order = orderRows[0];

  const itemsQuery = `
    SELECT * FROM order_items 
    WHERE order_id = ? 
    ORDER BY id ASC
  `;
  const [itemRows] = await pool.query(itemsQuery, [order.order_id]);

  const items = itemRows.map((item) => ({
    ...item,
    slot_photos:
      typeof item.slot_photos === "string"
        ? JSON.parse(item.slot_photos)
        : item.slot_photos || {},
  }));

  return {
    ...order,
    items,
  };
};

const getOrdersByUser = async (userId) => {
  const pool = getDB();
  const query = `
    SELECT 
      o.*,
      COUNT(oi.id) AS item_count
    FROM orders o
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;

  const [rows] = await pool.query(query, [userId]);
  return rows;
};

const updateOrderStatus = async (orderId, updateData) => {
  const pool = getDB();
  const { order_status, payment_status } = updateData;

  let query = `UPDATE orders SET updated_at = NOW()`;
  const values = [];

  if (order_status) {
    query += `, order_status = ?`;
    values.push(order_status);
  }

  if (payment_status) {
    query += `, payment_status = ?`;
    values.push(payment_status);
  }

  query += ` WHERE order_id = ? OR id = ?`;
  values.push(orderId, orderId);

  const [result] = await pool.query(query, values);
  return result.affectedRows > 0;
};

const deleteOrder = async (orderId) => {
  const pool = getDB();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Look up order_id if passed as numeric id
    const [orders] = await connection.query(
      `SELECT order_id FROM orders WHERE id = ? OR order_id = ? LIMIT 1`,
      [orderId, orderId]
    );

    if (!orders.length) {
      await connection.rollback();
      return false;
    }

    const actualOrderId = orders[0].order_id;

    await connection.query(`DELETE FROM order_items WHERE order_id = ?`, [actualOrderId]);
    const [result] = await connection.query(`DELETE FROM orders WHERE order_id = ?`, [actualOrderId]);

    await connection.commit();
    return result.affectedRows > 0;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  deleteOrder,
};
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
      `INSERT INTO orders (order_id, customer_id, billing_type, order_date, order_time, total_items, subtotal, discount_amount, tax_amount, total_amount, payment_method, payment_status, order_status, notes, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, orderData.customer_id, orderData.billing_type, orderData.order_date, orderData.order_time || "00:00", orderData.total_items, orderData.subtotal, orderData.discount_amount, orderData.tax_amount, orderData.total_amount, orderData.payment_method, orderData.payment_status, orderData.order_status, orderData.notes || "", orderData.created_by, orderData.updated_by]
    );

    if (items.length) {
      await connection.query(
        `INSERT INTO order_items (item_id, order_id, product_id, product_name, product_code, product_image, quantity, unit_price, discount, tax, total_price) VALUES ?`,
        [items.map((item, index) => [`${orderId}-ITEM${String(index + 1).padStart(3, "0")}`, orderId, item.product_id, item.product_name, item.product_code || null, item.product_image || "", item.quantity, item.unit_price, item.discount || 0, item.tax || 0, item.total_price])]
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
