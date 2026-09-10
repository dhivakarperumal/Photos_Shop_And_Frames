const { getDB } = require("../config/db");

let wishlistTableReady;

const ensureWishlistTable = async () => {
  if (!wishlistTableReady) {
    wishlistTableReady = (async () => {
      const pool = getDB();
      await pool.query(`
      CREATE TABLE IF NOT EXISTS wishlists (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        product_id INT(11) NOT NULL,
        variant_color VARCHAR(100) NULL,
        variant_size VARCHAR(100) NULL,
        image VARCHAR(500) NULL,
        email VARCHAR(255) NULL,
        item_type VARCHAR(30) NOT NULL DEFAULT 'product',
        item_name VARCHAR(255) NULL,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_wishlist_user_product (user_id, product_id),
        KEY idx_wishlist_user (user_id),
        KEY idx_wishlist_product (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      const columns = {
        variant_color: "VARCHAR(100) NULL",
        variant_size: "VARCHAR(100) NULL",
        image: "VARCHAR(500) NULL",
        email: "VARCHAR(255) NULL",
        item_type: "VARCHAR(30) NOT NULL DEFAULT 'product'",
        item_name: "VARCHAR(255) NULL",
        price: "DECIMAL(10,2) NOT NULL DEFAULT 0.00",
        total_price: "DECIMAL(10,2) NOT NULL DEFAULT 0.00",
      };

      for (const [column, definition] of Object.entries(columns)) {
        const [rows] = await pool.query(
          `SELECT 1 FROM information_schema.COLUMNS
           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'wishlists' AND COLUMN_NAME = ? LIMIT 1`,
          [column],
        );
        if (!rows.length) {
          await pool.query(`ALTER TABLE wishlists ADD COLUMN ${column} ${definition}`);
        }
      }
    })().catch((error) => {
      wishlistTableReady = undefined;
      throw error;
    });
  }
  await wishlistTableReady;
};

const getWishlistByUser = async (userId) => {
  const pool = getDB();
  await ensureWishlistTable();
  const [rows] = await pool.query(
    `SELECT w.id, w.user_id, w.product_id, w.variant_color, w.variant_size,
        w.image, w.email, w.item_type, w.item_name, w.price, w.total_price, w.created_at,
           COALESCE(w.item_name,
          CASE WHEN w.item_type = 'gift' THEN g.name
            WHEN w.item_type = 'album' THEN a.product_name
            ELSE p.product_name END,
          p.product_name, a.product_name, g.name) AS product_name,
           COALESCE(p.category, a.category, g.category) AS category,
           CASE WHEN w.item_type = 'gift' OR (w.item_type = 'product' AND p.id IS NULL AND g.id IS NOT NULL) THEN 'gift'
             WHEN w.item_type = 'album' OR (w.item_type = 'product' AND p.id IS NULL AND a.id IS NOT NULL) THEN 'album'
             ELSE 'product' END AS resolved_item_type,
           COALESCE(NULLIF(w.price, 0), a.discount_price, a.selling_price, g.selling_price, g.mrp, 0) AS resolved_price,
        p.product_images, p.frame_data, p.orientation, p.size_variants,
        a.product_images AS album_images, a.thumbnail_image,
        g.images AS gift_images, g.image AS gift_image
       FROM wishlists w
      LEFT JOIN products p ON p.id = w.product_id
      LEFT JOIN albums a ON a.id = w.product_id
      LEFT JOIN gift_boxes g ON g.id = w.product_id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC`,
    [userId],
  );

  return rows.map((row) => {
    const productImages = parseJson(row.product_images || row.album_images || row.gift_images, []);
    const frameData = parseJson(row.frame_data, null);
    const sizeVariants = parseJson(row.size_variants, []);
    const firstVariant = Array.isArray(sizeVariants) ? sizeVariants[0] || {} : {};
    const price = Number(row.price || firstVariant.offer_price || firstVariant.mrp || 0);

    return {
      ...row,
      item_type: row.resolved_item_type || row.item_type,
      image: row.image || productImages[0] || row.thumbnail_image || row.gift_image || frameData?.frame_image || null,
      price: Number(row.resolved_price || price),
      total_price: Number(row.total_price || price),
      product_images: productImages,
      frame_data: frameData,
      size_variants: sizeVariants,
    };
  });
};

const addToWishlist = async (wishlistData) => {
  const pool = getDB();
  await ensureWishlistTable();
  const {
    user_id,
    product_id,
    variant_color = "",
    variant_size = "",
    image = null,
    email = "",
    price = 0,
    total_price = price,
    item_type = "product",
    item_name = null,
  } = wishlistData;

  await pool.query(
    `INSERT INTO wishlists
      (user_id, product_id, variant_color, variant_size, image, email, item_type, item_name, price, total_price)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      variant_color = VALUES(variant_color), variant_size = VALUES(variant_size),
      image = VALUES(image), email = VALUES(email), item_type = VALUES(item_type),
      item_name = VALUES(item_name), price = VALUES(price),
      total_price = VALUES(total_price), updated_at = NOW()`,
    [user_id, Number(product_id), variant_color, variant_size, image, email, item_type, item_name, Number(price), Number(total_price)],
  );

  return getWishlistByUser(user_id);
};

const removeFromWishlist = async (userId, productId) => {
  const pool = getDB();
  await ensureWishlistTable();
  const [result] = await pool.query(
    "DELETE FROM wishlists WHERE user_id = ? AND product_id = ?",
    [userId, Number(productId)],
  );
  return result.affectedRows > 0;
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

module.exports = { getWishlistByUser, addToWishlist, removeFromWishlist };
