const { getDB } = require("../config/db");

const getNextCategoryId = async () => {
  const query = `
    SELECT category_id
    FROM categories
    WHERE category_id REGEXP '^CAT[0-9]+$'
    ORDER BY CAST(SUBSTRING(category_id, 4) AS UNSIGNED) DESC
    LIMIT 1
  `;

  const pool = getDB();
  const [rows] = await pool.query(query);
  const lastId = rows?.[0]?.category_id || 'CAT000';
  const lastNumber = Number(String(lastId).replace(/\D/g, '')) || 0;
  const nextNumber = lastNumber + 1;

  return `CAT${String(nextNumber).padStart(3, '0')}`;
};

const createCategory = async (categoryData) => {
  const {
    category_id,
    category_type,
    category_name,
    sub_categories,
    description,
    category_image,
    sort_order,
    status,
    created_by,
    updated_by,
    created_date,
    updated_date,
  } = categoryData;

  const query = `
    INSERT INTO categories (
      category_id,
      category_type,
      category_name,
      sub_categories,
      description,
      category_image,
      sort_order,
      status,
      created_by,
      updated_by,
      created_date,
      updated_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    category_id,
    category_type,
    category_name,
    JSON.stringify(sub_categories || []),
    description || "",
    category_image || null,
    Number(sort_order || 1),
    status || "Active",
    created_by || "Admin",
    updated_by || created_by || "Admin",
    created_date || new Date().toISOString(),
    updated_date || created_date || new Date().toISOString(),
  ];

  const pool = getDB();
  const [result] = await pool.query(query, values);

  return {
    id: result.insertId,
    category_id,
    category_type,
    category_name,
    sub_categories: sub_categories || [],
    status: status || "Active",
  };
};

const getAllCategories = async () => {
  const query = `
    SELECT * FROM categories ORDER BY sort_order ASC, created_date DESC
  `;

  const pool = getDB();
  const [rows] = await pool.query(query);

  return rows.map((row) => ({
    ...row,
    sub_categories: row.sub_categories ? JSON.parse(row.sub_categories) : [],
  }));
};

const getCategoryById = async (categoryId) => {
  const query = `SELECT * FROM categories WHERE category_id = ? LIMIT 1`;
  const pool = getDB();
  const [rows] = await pool.query(query, [categoryId]);

  if (!rows.length) return null;

  const category = rows[0];
  return {
    ...category,
    sub_categories: category.sub_categories ? JSON.parse(category.sub_categories) : [],
  };
};

const updateCategory = async (categoryId, updateData) => {
  const {
    category_type,
    category_name,
    sub_categories,
    description,
    category_image,
    sort_order,
    status,
    updated_by,
    updated_date,
  } = updateData;

  const query = `
    UPDATE categories
    SET category_type = ?,
        category_name = ?,
        sub_categories = ?,
        description = ?,
        category_image = ?,
        sort_order = ?,
        status = ?,
        updated_by = ?,
        updated_date = ?
    WHERE category_id = ?
  `;

  const values = [
    category_type,
    category_name,
    JSON.stringify(sub_categories || []),
    description || "",
    category_image || null,
    Number(sort_order || 1),
    status || "Active",
    updated_by || "Admin",
    updated_date || new Date().toISOString(),
    categoryId,
  ];

  const pool = getDB();
  const [result] = await pool.query(query, values);

  return {
    affectedRows: result.affectedRows,
    category_id: categoryId,
  };
};

const deleteCategory = async (categoryId) => {
  const query = `DELETE FROM categories WHERE category_id = ?`;
  const pool = getDB();
  const [result] = await pool.query(query, [categoryId]);

  return {
    affectedRows: result.affectedRows,
    category_id: categoryId,
  };
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
