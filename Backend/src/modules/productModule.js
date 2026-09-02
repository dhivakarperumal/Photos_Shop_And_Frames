const { getDB } = require("../config/db");

/**
 * Product Module
 * Handles products with size variants (size-wise MRP, Offer, Stock),
 * linked frame templates, and slot demo photos.
 */

const getNextProductId = async () => {
  const pool = getDB();
  const query = `
    SELECT product_id
    FROM products
    WHERE product_id REGEXP '^IQF[0-9]+$'
    ORDER BY CAST(SUBSTRING(product_id, 4) AS UNSIGNED) DESC
    LIMIT 1
  `;

  const [rows] = await pool.query(query);
  const lastId = rows?.[0]?.product_id || "IQF0";
  const lastNumber = Number(String(lastId).replace(/\D/g, "")) || 0;
  const nextNumber = lastNumber + 1;

  return `IQF${nextNumber}`;
};

const createProduct = async (productData) => {
  const {
    uuid,
    product_id,
    product_name,
    category,
    material_type,
    color,
    description,
    size_variants,
    orientation,
    frame_id,
    frame_data,
    slot_photos,
    product_images,
    status = "Active",
    created_by = null,
    updated_by = null,
  } = productData;

  const query = `
    INSERT INTO products (
      uuid,
      product_id,
      product_name,
      category,
      material_type,
      color,
      description,
      size_variants,
      orientation,
      frame_id,
      frame_data,
      slot_photos,
      product_images,
      status,
      created_by,
      updated_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    uuid,
    product_id,
    product_name,
    category,
    material_type || null,
    color || null,
    description || null,
    JSON.stringify(size_variants || []),
    orientation || "Portrait",
    frame_id ? Number(frame_id) : null,
    frame_data ? JSON.stringify(frame_data) : null,
    slot_photos ? JSON.stringify(slot_photos) : null,
    product_images ? JSON.stringify(product_images) : null,
    status || "Active",
    created_by || null,
    updated_by || created_by || null,
  ];

  const pool = getDB();
  const [result] = await pool.query(query, values);

  return {
    id: result.insertId,
    uuid,
    product_id,
    product_name,
    category,
    size_variants: size_variants || [],
    orientation,
    frame_id,
    status,
  };
};

const getAllProducts = async (filters = {}) => {
  const pool = getDB();
  let query = `SELECT * FROM products WHERE 1=1`;
  const values = [];

  if (filters.category) {
    query += ` AND category = ?`;
    values.push(filters.category);
  }

  if (filters.orientation) {
    query += ` AND LOWER(orientation) = LOWER(?)`;
    values.push(filters.orientation);
  }

  if (filters.status) {
    query += ` AND status = ?`;
    values.push(filters.status);
  }

  if (filters.search) {
    query += ` AND (product_name LIKE ? OR product_id LIKE ? OR description LIKE ?)`;
    const searchPattern = `%${filters.search}%`;
    values.push(searchPattern, searchPattern, searchPattern);
  }

  query += ` ORDER BY created_at DESC`;

  const [rows] = await pool.query(query, values);

  return rows.map((row) => ({
    ...row,
    size_variants: row.size_variants
      ? typeof row.size_variants === "string"
        ? JSON.parse(row.size_variants)
        : row.size_variants
      : [],
    frame_data: row.frame_data
      ? typeof row.frame_data === "string"
        ? JSON.parse(row.frame_data)
        : row.frame_data
      : null,
    slot_photos: row.slot_photos
      ? typeof row.slot_photos === "string"
        ? JSON.parse(row.slot_photos)
        : row.slot_photos
      : {},
    product_images: row.product_images
      ? typeof row.product_images === "string"
        ? JSON.parse(row.product_images)
        : row.product_images
      : [],
  }));
};

const getProductById = async (idOrUuid) => {
  const pool = getDB();
  const isNumeric = !isNaN(idOrUuid);
  const query = isNumeric
    ? `SELECT * FROM products WHERE id = ? LIMIT 1`
    : `SELECT * FROM products WHERE uuid = ? OR product_id = ? LIMIT 1`;

  const values = isNumeric ? [idOrUuid] : [idOrUuid, idOrUuid];
  const [rows] = await pool.query(query, values);

  if (!rows.length) return null;

  const row = rows[0];
  return {
    ...row,
    size_variants: row.size_variants
      ? typeof row.size_variants === "string"
        ? JSON.parse(row.size_variants)
        : row.size_variants
      : [],
    frame_data: row.frame_data
      ? typeof row.frame_data === "string"
        ? JSON.parse(row.frame_data)
        : row.frame_data
      : null,
    slot_photos: row.slot_photos
      ? typeof row.slot_photos === "string"
        ? JSON.parse(row.slot_photos)
        : row.slot_photos
      : {},
    product_images: row.product_images
      ? typeof row.product_images === "string"
        ? JSON.parse(row.product_images)
        : row.product_images
      : [],
  };
};

const updateProduct = async (id, updateData) => {
  const {
    product_name,
    category,
    material_type,
    color,
    description,
    size_variants,
    orientation,
    frame_id,
    frame_data,
    slot_photos,
    product_images,
    status,
    updated_by = null,
  } = updateData;

  const query = `
    UPDATE products
    SET product_name = ?,
        category = ?,
        material_type = ?,
        color = ?,
        description = ?,
        size_variants = ?,
        orientation = ?,
        frame_id = ?,
        frame_data = ?,
        slot_photos = ?,
        product_images = ?,
        status = ?,
        updated_by = ?
    WHERE id = ? OR uuid = ? OR product_id = ?
  `;

  const values = [
    product_name,
    category,
    material_type || null,
    color || null,
    description || null,
    JSON.stringify(size_variants || []),
    orientation || "Portrait",
    frame_id ? Number(frame_id) : null,
    frame_data ? JSON.stringify(frame_data) : null,
    slot_photos ? JSON.stringify(slot_photos) : null,
    product_images ? JSON.stringify(product_images) : null,
    status || "Active",
    updated_by || null,
    id,
    id,
    id,
  ];

  const pool = getDB();
  const [result] = await pool.query(query, values);

  return {
    affectedRows: result.affectedRows,
    id,
  };
};

const deleteProduct = async (idOrUuid) => {
  const pool = getDB();
  const isNumeric = !isNaN(idOrUuid);
  const query = isNumeric
    ? `DELETE FROM products WHERE id = ?`
    : `DELETE FROM products WHERE uuid = ? OR product_id = ?`;

  const values = isNumeric ? [idOrUuid] : [idOrUuid, idOrUuid];
  const [result] = await pool.query(query, values);

  return {
    affectedRows: result.affectedRows,
    id: idOrUuid,
  };
};

module.exports = {
  getNextProductId,
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
