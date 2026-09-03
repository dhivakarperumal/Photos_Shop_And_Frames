const { getDB } = require("../config/db");

const ensureCouponsTable = async () => {
  const pool = getDB();
  const query = `
    CREATE TABLE IF NOT EXISTS coupons (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(100) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      discount_type VARCHAR(50) NOT NULL DEFAULT 'percentage',
      discount_value DECIMAL(10,2) NOT NULL DEFAULT 0,
      min_order_value DECIMAL(10,2) NOT NULL DEFAULT 0,
      start_date DATETIME,
      expiry_date DATETIME,
      usage_limit_global INT DEFAULT 0,
      usage_limit_per_customer INT DEFAULT 1,
      status VARCHAR(30) NOT NULL DEFAULT 'active',
      coupon_scope VARCHAR(50) NOT NULL DEFAULT 'all',
      applicable_product_ids JSON,
      applicable_category_ids JSON,
      applicable_subcategory_ids JSON,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  await pool.query(query);
};

const normalizeCoupon = (coupon) => ({
  ...coupon,
  applicable_product_ids: coupon.applicable_product_ids ? JSON.parse(coupon.applicable_product_ids) : [],
  applicable_category_ids: coupon.applicable_category_ids ? JSON.parse(coupon.applicable_category_ids) : [],
  applicable_subcategory_ids: coupon.applicable_subcategory_ids ? JSON.parse(coupon.applicable_subcategory_ids) : [],
});

const getAllCoupons = async () => {
  await ensureCouponsTable();
  const pool = getDB();
  const [rows] = await pool.query(`
    SELECT * FROM coupons ORDER BY created_at DESC, id DESC
  `);

  return rows.map(normalizeCoupon);
};

const getCouponById = async (id) => {
  await ensureCouponsTable();
  const pool = getDB();
  const [rows] = await pool.query(`SELECT * FROM coupons WHERE id = ? LIMIT 1`, [id]);

  if (!rows.length) return null;
  return normalizeCoupon(rows[0]);
};

const createCoupon = async (couponData = {}) => {
  await ensureCouponsTable();
  const pool = getDB();

  const {
    code,
    name,
    description = "",
    discount_type = "percentage",
    discount_value = 0,
    min_order_value = 0,
    start_date = null,
    expiry_date = null,
    usage_limit_global = 0,
    usage_limit_per_customer = 1,
    status = "active",
    coupon_scope = "all",
    applicable_product_ids = [],
    applicable_category_ids = [],
    applicable_subcategory_ids = [],
  } = couponData;

  if (!code || !name) {
    throw new Error("Coupon code and name are required");
  }

  const [result] = await pool.query(
    `
      INSERT INTO coupons (
        code,
        name,
        description,
        discount_type,
        discount_value,
        min_order_value,
        start_date,
        expiry_date,
        usage_limit_global,
        usage_limit_per_customer,
        status,
        coupon_scope,
        applicable_product_ids,
        applicable_category_ids,
        applicable_subcategory_ids
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      String(code).trim(),
      String(name).trim(),
      description || "",
      discount_type || "percentage",
      Number(discount_value || 0),
      Number(min_order_value || 0),
      start_date || null,
      expiry_date || null,
      Number(usage_limit_global || 0),
      Number(usage_limit_per_customer || 1),
      status || "active",
      coupon_scope || "all",
      JSON.stringify(Array.isArray(applicable_product_ids) ? applicable_product_ids : []),
      JSON.stringify(Array.isArray(applicable_category_ids) ? applicable_category_ids : []),
      JSON.stringify(Array.isArray(applicable_subcategory_ids) ? applicable_subcategory_ids : []),
    ]
  );

  return {
    id: result.insertId,
    ...couponData,
    code: String(code).trim(),
    name: String(name).trim(),
    status: status || "active",
    coupon_scope: coupon_scope || "all",
    applicable_product_ids: Array.isArray(applicable_product_ids) ? applicable_product_ids : [],
    applicable_category_ids: Array.isArray(applicable_category_ids) ? applicable_category_ids : [],
    applicable_subcategory_ids: Array.isArray(applicable_subcategory_ids) ? applicable_subcategory_ids : [],
  };
};

const updateCoupon = async (id, couponData = {}) => {
  await ensureCouponsTable();
  const pool = getDB();

  const {
    code,
    name,
    description = "",
    discount_type = "percentage",
    discount_value = 0,
    min_order_value = 0,
    start_date = null,
    expiry_date = null,
    usage_limit_global = 0,
    usage_limit_per_customer = 1,
    status = "active",
    coupon_scope = "all",
    applicable_product_ids = [],
    applicable_category_ids = [],
    applicable_subcategory_ids = [],
  } = couponData;

  const [result] = await pool.query(
    `
      UPDATE coupons
      SET code = ?,
          name = ?,
          description = ?,
          discount_type = ?,
          discount_value = ?,
          min_order_value = ?,
          start_date = ?,
          expiry_date = ?,
          usage_limit_global = ?,
          usage_limit_per_customer = ?,
          status = ?,
          coupon_scope = ?,
          applicable_product_ids = ?,
          applicable_category_ids = ?,
          applicable_subcategory_ids = ?
      WHERE id = ?
    `,
    [
      String(code || "").trim(),
      String(name || "").trim(),
      description || "",
      discount_type || "percentage",
      Number(discount_value || 0),
      Number(min_order_value || 0),
      start_date || null,
      expiry_date || null,
      Number(usage_limit_global || 0),
      Number(usage_limit_per_customer || 1),
      status || "active",
      coupon_scope || "all",
      JSON.stringify(Array.isArray(applicable_product_ids) ? applicable_product_ids : []),
      JSON.stringify(Array.isArray(applicable_category_ids) ? applicable_category_ids : []),
      JSON.stringify(Array.isArray(applicable_subcategory_ids) ? applicable_subcategory_ids : []),
      id,
    ]
  );

  return {
    affectedRows: result.affectedRows,
    id,
  };
};

const deleteCoupon = async (id) => {
  await ensureCouponsTable();
  const pool = getDB();
  const [result] = await pool.query(`DELETE FROM coupons WHERE id = ?`, [id]);

  return {
    affectedRows: result.affectedRows,
    id,
  };
};

module.exports = {
  ensureCouponsTable,
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
