const { getDB } = require("../config/db");
const { randomUUID } = require("crypto");

/**
 * Generates a clean human-readable Order ID
 * Format: ORD-YYYYMMDD-XXXX (e.g. ORD-20260903-D38W)
 */
const generateOrderId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${year}${month}${day}-${randomChars}`;
};

const createOrder = async ({ orderData, items = [], address = null }) => {
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
        billing_type,
        order_date,
        city,
        state,
        pincode,
        total_amount,
        payment_method,
        payment_status,
        order_status,
        notes,
        created_by,
        updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const orderValues = [
      orderId,
      orderData.user_id || null,
      orderData.customer_name,
      orderData.customer_email || "",
      orderData.customer_phone,
      orderData.shipping_address,
      orderData.billing_type || "Online Order",
      orderData.order_date || null,
      orderData.city || "",
      orderData.state || "",
      orderData.pincode || "",
      Number(orderData.total_amount || 0),
      orderData.payment_method || "Cash On Delivery",
      orderData.payment_status || "Pending",
      orderData.order_status || "Pending",
      orderData.notes || "",
      orderData.created_by || orderData.user_id || null,
      orderData.updated_by || orderData.user_id || null,
    ];

    const [orderResult] = await connection.query(insertOrderQuery, orderValues);

    // Insert order items
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
        frame_image,
        created_by,
        updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const item of items) {
      const itemValues = [
        orderId,
        Number.parseInt(item.product_id ?? item.id, 10) || 0,
        item.product_name || "Custom Frame",
        item.category || "Photo Frames",
        item.size || "Standard",
        Number(item.price || item.unit_price || 0),
        Number(item.quantity || 1),
        Number(item.total_price || (Number(item.price || item.unit_price || 0) * Number(item.quantity || 1))),
        item.customization_id || null,
        item.slot_photos ? (typeof item.slot_photos === "string" ? item.slot_photos : JSON.stringify(item.slot_photos)) : null,
        item.product_image || null,
        item.frame_image || null,
        orderData.created_by || orderData.user_id || null,
        orderData.updated_by || orderData.user_id || null,
      ];

      await connection.query(insertItemQuery, itemValues);
    }

    if (address) {
      const customerId = address.customer_id || null;
      const userId = address.user_id || null;
      const addressValues = [
        customerId,
        userId,
        String(address.customer_name || orderData.customer_name || "").trim(),
        String(address.mobile_number || orderData.customer_phone || "").trim(),
        String(address.address_line1 || "").trim(),
        String(address.address_line2 || "").trim(),
        String(address.city || orderData.city || "").trim(),
        String(address.district || "").trim(),
        String(address.state || orderData.state || "").trim(),
        String(address.country || "").trim(),
        String(address.pincode || orderData.pincode || "").trim(),
        String(address.landmark || "").trim(),
      ];
      const addressFieldValues = addressValues.slice(2).map((value) => value.toLowerCase());

      const [existingAddresses] = await connection.query(
        `SELECT id FROM addresses
         WHERE ((? IS NOT NULL AND customer_id = ?)
            OR (? IS NULL AND user_id = ?))
           AND LOWER(COALESCE(customer_name, '')) = ?
           AND LOWER(COALESCE(mobile_number, '')) = ?
           AND LOWER(COALESCE(address_line1, '')) = ?
           AND LOWER(COALESCE(address_line2, '')) = ?
           AND LOWER(COALESCE(city, '')) = ?
           AND LOWER(COALESCE(district, '')) = ?
           AND LOWER(COALESCE(state, '')) = ?
           AND LOWER(COALESCE(country, '')) = ?
           AND LOWER(COALESCE(pincode, '')) = ?
           AND LOWER(COALESCE(landmark, '')) = ?
         LIMIT 1`,
        [customerId, customerId, customerId, userId, ...addressFieldValues],
      );

      if (!existingAddresses.length) {
        await connection.query(
          `INSERT INTO addresses (
            address_id, user_id, customer_id, order_id, address_type,
            customer_name, mobile_number, address_line1, address_line2,
            city, district, state, country, pincode, landmark,
            created_by, updated_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `ADDR-${randomUUID()}`,
            address.user_id || null,
            address.customer_id || null,
            orderId,
            address.address_type || "Shipping",
            ...addressValues.slice(2),
            orderData.created_by || orderData.user_id || null,
            orderData.updated_by || orderData.user_id || null,
          ],
        );
      }
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

  if (filters.billing_type) {
    query += ` AND o.billing_type = ?`;
    values.push(filters.billing_type);
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
    SELECT 
      oi.*,
      cp.preview_image AS customized_preview_image
    FROM order_items oi 
    LEFT JOIN customized_photos cp ON oi.customization_id = cp.customization_id
    WHERE oi.order_id = ? 
    ORDER BY oi.id ASC
  `;
  const [itemRows] = await pool.query(itemsQuery, [order.order_id]);

  const items = itemRows.map((item) => ({
    ...item,
    slot_photos:
      typeof item.slot_photos === "string"
        ? JSON.parse(item.slot_photos)
        : item.slot_photos || {},
    whole_frame_image:
      item.customized_preview_image ||
      item.product_image ||
      item.frame_image ||
      null,
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
  const { order_status, payment_status, updated_by } = updateData;

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

  if (updated_by) {
    query += `, updated_by = ?`;
    values.push(updated_by);
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
  getOrders: getAllOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  deleteOrder,
};
