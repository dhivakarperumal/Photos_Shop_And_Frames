const { getDB } = require("../config/db");

let wishlistTableReady;

const ensureWishlistTable = async () => {
  if (!wishlistTableReady) {
    wishlistTableReady = getDB().query(`
      CREATE TABLE IF NOT EXISTS wishlists (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        product_id INT(11) NOT NULL,
        variant_color VARCHAR(100) NULL,
        variant_size VARCHAR(100) NULL,
        image VARCHAR(500) NULL,
        email VARCHAR(255) NULL,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_wishlist_user_product (user_id, product_id),
        KEY idx_wishlist_user (user_id),
        KEY idx_wishlist_product (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }
  await wishlistTableReady;
};

const getWishlistByUser = async (userId) => {
  const pool = getDB();
  await ensureWishlistTable();
  const [rows] = await pool.query(
    `SELECT w.id, w.user_id, w.product_id, w.variant_color, w.variant_size,
            w.image, w.email, w.price, w.total_price, w.created_at,
            p.product_name, p.category, p.product_images, p.frame_data,
            p.orientation, p.size_variants
       FROM wishlists w
       LEFT JOIN products p ON p.id = w.product_id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC`,
    [userId],
  );

  return rows.map((row) => {
    const productImages = parseJson(row.product_images, []);
    const frameData = parseJson(row.frame_data, null);
    const sizeVariants = parseJson(row.size_variants, []);
    const firstVariant = Array.isArray(sizeVariants) ? sizeVariants[0] || {} : {};
    const price = Number(row.price || firstVariant.offer_price || firstVariant.mrp || 0);

    return {
      ...row,
      image: row.image || productImages[0] || frameData?.frame_image || null,
      price,
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
  } = wishlistData;

  await pool.query(
    `INSERT INTO wishlists
      (user_id, product_id, variant_color, variant_size, image, email, price, total_price)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      variant_color = VALUES(variant_color), variant_size = VALUES(variant_size),
      image = VALUES(image), email = VALUES(email), price = VALUES(price),
      total_price = VALUES(total_price), updated_at = NOW()`,
    [user_id, Number(product_id), variant_color, variant_size, image, email, Number(price), Number(total_price)],
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
