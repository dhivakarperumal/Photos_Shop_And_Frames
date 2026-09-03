const { getDB } = require("../config/db");

/**
 * Cart Module
 * Supports multi-user cart persistence in the carts table.
 */

const getCartByUser = async (userId) => {
  const pool = getDB();
  const query = `
    SELECT 
      c.id,
      c.user_id,
      c.product_id,
      c.customization_id,
      c.size,
      c.price,
      c.quantity,
      (c.price * c.quantity) AS total_price,
      c.slot_photos,
      c.preview_image,
      c.created_at,
      c.updated_at,
      p.product_name,
      p.category,
      p.product_images,
      p.frame_data,
      p.orientation,
      p.size_variants,
      p.stock_quantity
    FROM carts c
    LEFT JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC
  `;

  const [rows] = await pool.query(query, [userId]);

  return rows.map((row) => ({
    ...row,
    slot_photos:
      typeof row.slot_photos === "string"
        ? JSON.parse(row.slot_photos)
        : row.slot_photos || {},
    product_images:
      typeof row.product_images === "string"
        ? JSON.parse(row.product_images)
        : row.product_images || [],
    frame_data:
      typeof row.frame_data === "string"
        ? JSON.parse(row.frame_data)
        : row.frame_data || null,
    size_variants:
      typeof row.size_variants === "string"
        ? JSON.parse(row.size_variants)
        : row.size_variants || [],
  }));
};

const addToCart = async (cartData) => {
  const {
    user_id,
    product_id,
    customization_id = null,
    size,
    price,
    quantity = 1,
    slot_photos = null,
    preview_image = null,
    created_by = null,
    updated_by = created_by,
  } = cartData;

  const pool = getDB();

  // Check if identical item already in cart for this user
  const checkQuery = customization_id
    ? `SELECT id, quantity FROM carts WHERE user_id = ? AND product_id = ? AND size = ? AND customization_id = ? LIMIT 1`
    : `SELECT id, quantity FROM carts WHERE user_id = ? AND product_id = ? AND size = ? AND customization_id IS NULL LIMIT 1`;

  const checkValues = customization_id
    ? [user_id, Number(product_id), size, customization_id]
    : [user_id, Number(product_id), size];

  const [existing] = await pool.query(checkQuery, checkValues);

  if (existing.length > 0) {
    const existingId = existing[0].id;
    const newQty = existing[0].quantity + Number(quantity);

    await pool.query(
      `UPDATE carts SET quantity = ?, price = ?, preview_image = COALESCE(?, preview_image), updated_by = ?, updated_at = NOW() WHERE id = ?`,
      [newQty, Number(price), preview_image || null, updated_by, existingId]
    );

    return {
      id: existingId,
      user_id,
      product_id,
      customization_id,
      size,
      price: Number(price),
      quantity: newQty,
      preview_image,
    };
  }

  const insertQuery = `
    INSERT INTO carts (
      user_id,
      product_id,
      customization_id,
      size,
      price,
      quantity,
      slot_photos,
      preview_image,
      created_by,
      updated_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const insertValues = [
    user_id,
    Number(product_id),
    customization_id || null,
    size,
    Number(price),
    Number(quantity),
    slot_photos ? JSON.stringify(slot_photos) : null,
    preview_image || null,
    created_by,
    updated_by,
  ];

  const [result] = await pool.query(insertQuery, insertValues);

  return {
    id: result.insertId,
    user_id,
    product_id,
    customization_id,
    size,
    price: Number(price),
    quantity: Number(quantity),
    preview_image,
  };
};

const updateCartItem = async (cartItemId, quantity, price, updatedBy = null) => {
  const pool = getDB();
  let query = `UPDATE carts SET quantity = ?`;
  const values = [Number(quantity)];

  if (price !== undefined && price !== null) {
    query += `, price = ?`;
    values.push(Number(price));
  }

  query += `, updated_by = ?, updated_at = NOW() WHERE id = ?`;
  values.push(updatedBy, cartItemId);

  const [result] = await pool.query(query, values);
  return result.affectedRows > 0;
};

const removeFromCart = async (cartItemId) => {
  const pool = getDB();
  const [result] = await pool.query(`DELETE FROM carts WHERE id = ?`, [cartItemId]);
  return result.affectedRows > 0;
};

const clearCart = async (userId) => {
  const pool = getDB();
  const [result] = await pool.query(`DELETE FROM carts WHERE user_id = ?`, [userId]);
  return result.affectedRows >= 0;
};

module.exports = {
  getCartByUser,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
