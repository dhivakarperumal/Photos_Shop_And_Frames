const { getDB } = require("../config/db");

const parseJson = (value, fallback) => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

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
      COALESCE(p.product_name, g.name, 'Item') AS product_name,
      COALESCE(p.category, g.category, 'Gifts') AS category,
      p.product_images,
      p.frame_data,
      p.orientation,
      p.size_variants,
      g.image AS gift_image,
      g.images AS gift_images
    FROM carts c
    LEFT JOIN products p ON c.product_id = p.id
    LEFT JOIN gift_boxes g ON (c.product_id = g.id OR c.product_id = g.gift_box_id)
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC
  `;

  const [rows] = await pool.query(query, [userId]);

  return rows.map((row) => ({
    ...row,
    preview_image: row.preview_image || row.gift_image || null,
    product_images: parseJson(row.product_images, parseJson(row.gift_images, row.gift_image ? [row.gift_image] : [])),
    slot_photos: parseJson(row.slot_photos, {}),
    frame_data: parseJson(row.frame_data, null),
    size_variants: parseJson(row.size_variants, []),
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
