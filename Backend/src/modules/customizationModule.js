const { getDB } = require("../config/db");

/**
 * Customization Module
 * Manages user-customized photos independently from the original products table.
 */

const createCustomization = async (data) => {
  const {
    customization_id,
    user_id = null,
    product_id,
    slot_photos = {},
    preview_image = null,
    created_by = null,
    updated_by = created_by,
  } = data;

  const pool = getDB();
  const query = `
    INSERT INTO customized_photos (
      customization_id,
      user_id,
      product_id,
      slot_photos,
      preview_image,
      created_by,
      updated_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    customization_id,
    user_id || null,
    Number(product_id),
    JSON.stringify(slot_photos || {}),
    preview_image || null,
    created_by,
    updated_by,
  ];

  const [result] = await pool.query(query, values);

  return {
    id: result.insertId,
    customization_id,
    user_id,
    product_id,
    slot_photos,
    preview_image,
  };
};

const getCustomizationById = async (customizationId) => {
  const pool = getDB();
  const query = `SELECT * FROM customized_photos WHERE customization_id = ? OR id = ? LIMIT 1`;
  const [rows] = await pool.query(query, [customizationId, customizationId]);

  if (!rows.length) return null;

  const row = rows[0];
  return {
    ...row,
    slot_photos:
      typeof row.slot_photos === "string"
        ? JSON.parse(row.slot_photos)
        : row.slot_photos || {},
  };
};

module.exports = {
  createCustomization,
  getCustomizationById,
};
