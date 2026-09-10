const { getDB } = require("../config/db");

let cartTableReady;

const ensureCartTable = async () => {
  if (!cartTableReady) {
    cartTableReady = (async () => {
      const pool = getDB();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS carts (
          id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          product_id INT(11) NOT NULL,
          customization_id VARCHAR(255) NULL,
          size VARCHAR(100) NOT NULL DEFAULT 'Standard',
          price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          quantity INT(11) NOT NULL DEFAULT 1,
          slot_photos JSON NULL,
          preview_image VARCHAR(500) NULL,
          item_type VARCHAR(30) NOT NULL DEFAULT 'product',
          created_by VARCHAR(255) NULL,
          updated_by VARCHAR(255) NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          KEY idx_user_id (user_id),
          KEY idx_product_id (product_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      const columns = {
        customization_id: "VARCHAR(255) NULL",
        size: "VARCHAR(100) NOT NULL DEFAULT 'Standard'",
        price: "DECIMAL(10,2) NOT NULL DEFAULT 0.00",
        quantity: "INT(11) NOT NULL DEFAULT 1",
        slot_photos: "JSON NULL",
        preview_image: "VARCHAR(500) NULL",
        item_type: "VARCHAR(30) NOT NULL DEFAULT 'product'",
        created_by: "VARCHAR(255) NULL",
        updated_by: "VARCHAR(255) NULL",
      };

      for (const [column, definition] of Object.entries(columns)) {
        const [rows] = await pool.query(
          `SELECT 1 FROM information_schema.COLUMNS
           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'carts' AND COLUMN_NAME = ? LIMIT 1`,
          [column],
        );
        if (!rows.length) {
          await pool.query(`ALTER TABLE carts ADD COLUMN ${column} ${definition}`);
        }
      }
    })().catch((error) => {
      cartTableReady = undefined;
      throw error;
    });
  }
  await cartTableReady;
};

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
  await ensureCartTable();
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
      COALESCE(
        c.item_type,
        CASE 
          WHEN c.preview_image LIKE '%/gifts/%' OR c.preview_image LIKE '%uploads/gifts%' THEN 'gift'
          WHEN c.preview_image LIKE '%/albums/%' OR c.preview_image LIKE '%uploads/albums%' THEN 'album'
          WHEN p.id IS NOT NULL THEN 'product'
          WHEN g.id IS NOT NULL THEN 'gift'
          WHEN a.id IS NOT NULL THEN 'album'
          ELSE 'product'
        END
      ) AS item_type,
      COALESCE(
        CASE 
          WHEN c.item_type = 'gift' THEN g.name
          WHEN c.item_type = 'album' THEN a.product_name
          WHEN c.item_type = 'product' THEN p.product_name
          WHEN (c.preview_image LIKE '%/gifts/%' OR c.preview_image LIKE '%uploads/gifts%') THEN g.name
          WHEN (c.preview_image LIKE '%/albums/%' OR c.preview_image LIKE '%uploads/albums%') THEN a.product_name
          ELSE NULL
        END,
        p.product_name, g.name, a.product_name, 'Item'
      ) AS product_name,
      COALESCE(
        CASE 
          WHEN c.item_type = 'gift' THEN g.category
          WHEN c.item_type = 'album' THEN a.category
          WHEN c.item_type = 'product' THEN p.category
          WHEN (c.preview_image LIKE '%/gifts/%' OR c.preview_image LIKE '%uploads/gifts%') THEN g.category
          WHEN (c.preview_image LIKE '%/albums/%' OR c.preview_image LIKE '%uploads/albums%') THEN a.category
          ELSE NULL
        END,
        p.category, g.category, a.category, 'Albums'
      ) AS category,
      p.product_images,
      p.frame_data,
      p.orientation,
      p.size_variants,
      g.image AS gift_image,
      g.images AS gift_images,
      g.box_size AS gift_box_size,
      g.current_stock AS gift_stock,
      a.thumbnail_image AS album_thumbnail,
      a.product_images AS album_images,
      a.stock_quantity AS album_stock
    FROM carts c
    LEFT JOIN products p ON (
      (c.item_type = 'product' OR (c.item_type IS NULL AND c.preview_image NOT LIKE '%/gifts/%' AND c.preview_image NOT LIKE '%/albums/%'))
      AND c.product_id = p.id
    )
    LEFT JOIN gift_boxes g ON (
      (c.item_type = 'gift' OR (c.item_type IS NULL AND (c.preview_image LIKE '%/gifts/%' OR c.preview_image LIKE '%uploads/gifts%')) OR (c.item_type IS NULL AND p.id IS NULL))
      AND (c.product_id = g.id OR c.product_id = g.gift_box_id)
    )
    LEFT JOIN albums a ON (
      (c.item_type = 'album' OR (c.item_type IS NULL AND (c.preview_image LIKE '%/albums/%' OR c.preview_image LIKE '%uploads/albums%')) OR (c.item_type IS NULL AND p.id IS NULL AND g.id IS NULL))
      AND (c.product_id = a.id OR c.product_id = a.product_id)
    )
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC
  `;

  const [rows] = await pool.query(query, [userId]);

  return rows.map((row) => {
    const isGift = row.item_type === "gift";
    const isAlbum = row.item_type === "album";

    const resolvedImages = isGift
      ? parseJson(row.gift_images, row.gift_image ? [row.gift_image] : [])
      : isAlbum
      ? parseJson(row.album_images, row.album_thumbnail ? [row.album_thumbnail] : [])
      : parseJson(row.product_images, []);

    const resolvedStock = isGift
      ? row.gift_stock
      : isAlbum
      ? row.album_stock
      : undefined;

    return {
      ...row,
      item_type: row.item_type || (isGift ? "gift" : isAlbum ? "album" : "product"),
      stock_quantity: resolvedStock !== undefined ? resolvedStock : row.stock_quantity,
      preview_image: row.preview_image || row.gift_image || row.album_thumbnail || null,
      product_images: resolvedImages,
      slot_photos: parseJson(row.slot_photos, {}),
      frame_data: isGift || isAlbum ? null : parseJson(row.frame_data, null),
      size_variants: isGift || isAlbum ? [] : parseJson(row.size_variants, []),
    };
  });
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
    item_type = "product",
    created_by = null,
    updated_by = created_by,
  } = cartData;

  const pool = getDB();
  await ensureCartTable();

  // Check if identical item already in cart for this user
  const checkQuery = customization_id
    ? `SELECT id, quantity FROM carts WHERE user_id = ? AND product_id = ? AND (item_type = ? OR (item_type IS NULL AND ? = 'product')) AND size = ? AND customization_id = ? LIMIT 1`
    : `SELECT id, quantity FROM carts WHERE user_id = ? AND product_id = ? AND (item_type = ? OR (item_type IS NULL AND ? = 'product')) AND size = ? AND customization_id IS NULL LIMIT 1`;

  const checkValues = customization_id
    ? [user_id, Number(product_id), item_type, item_type, size, customization_id]
    : [user_id, Number(product_id), item_type, item_type, size];

  const [existing] = await pool.query(checkQuery, checkValues);

  if (existing.length > 0) {
    const existingId = existing[0].id;
    const newQty = existing[0].quantity + Number(quantity);

    await pool.query(
      `UPDATE carts SET quantity = ?, price = ?, item_type = ?, preview_image = COALESCE(?, preview_image), updated_by = ?, updated_at = NOW() WHERE id = ?`,
      [newQty, Number(price), item_type, preview_image || null, updated_by, existingId]
    );

    return {
      id: existingId,
      user_id,
      product_id,
      item_type,
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
      item_type,
      customization_id,
      size,
      price,
      quantity,
      slot_photos,
      preview_image,
      created_by,
      updated_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const insertValues = [
    user_id,
    Number(product_id),
    item_type,
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
    item_type,
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
