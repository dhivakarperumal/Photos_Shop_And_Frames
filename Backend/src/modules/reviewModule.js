const { getDB } = require("../config/db");

/**
 * Review Module
 * Handles product reviews, ratings, customer review photos, and statistics.
 */

const getNextReviewId = async () => {
  const pool = getDB();
  const query = `
    SELECT review_id
    FROM reviews
    WHERE review_id REGEXP '^REV[0-9]+$'
    ORDER BY CAST(SUBSTRING(review_id, 4) AS UNSIGNED) DESC
    LIMIT 1
  `;

  const [rows] = await pool.query(query);
  const lastId = rows?.[0]?.review_id || "REV000";
  const lastNumber = Number(String(lastId).replace(/\D/g, "")) || 0;
  const nextNumber = lastNumber + 1;

  return `REV${String(nextNumber).padStart(3, "0")}`;
};

const createReview = async (reviewData) => {
  const {
    uuid,
    review_id,
    product_id,
    product_code,
    product_name,
    product_image,
    reviewer_name,
    reviewer_email,
    rating,
    title,
    comment,
    review_photo,
    status = "Published",
    created_by = "Admin",
    updated_by = "Admin",
  } = reviewData;

  const query = `
    INSERT INTO reviews (
      uuid,
      review_id,
      product_id,
      product_code,
      product_name,
      product_image,
      reviewer_name,
      reviewer_email,
      rating,
      title,
      comment,
      review_photo,
      status,
      created_by,
      updated_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    uuid,
    review_id,
    product_id ? Number(product_id) : null,
    product_code,
    product_name,
    product_image || null,
    reviewer_name,
    reviewer_email || null,
    Number(rating || 5),
    title || null,
    comment,
    review_photo || null,
    status || "Published",
    created_by || "Admin",
    updated_by || "Admin",
  ];

  const pool = getDB();
  const [result] = await pool.query(query, values);

  return {
    id: result.insertId,
    uuid,
    review_id,
    product_id,
    product_code,
    product_name,
    reviewer_name,
    rating,
    comment,
    review_photo,
    status,
  };
};

const getAllReviews = async (filters = {}) => {
  const pool = getDB();
  let query = `SELECT * FROM reviews WHERE 1=1`;
  const values = [];

  if (filters.product_id) {
    query += ` AND (product_id = ? OR product_code = ?)`;
    values.push(filters.product_id, filters.product_id);
  }

  if (filters.rating) {
    query += ` AND rating = ?`;
    values.push(Number(filters.rating));
  }

  if (filters.status && filters.status !== "All") {
    query += ` AND status = ?`;
    values.push(filters.status);
  }

  if (filters.search) {
    query += ` AND (reviewer_name LIKE ? OR product_name LIKE ? OR product_code LIKE ? OR comment LIKE ?)`;
    const searchPattern = `%${filters.search}%`;
    values.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }

  query += ` ORDER BY created_at DESC`;

  const [rows] = await pool.query(query, values);
  return rows;
};

const getReviewById = async (idOrUuid) => {
  const pool = getDB();
  const isNumeric = !isNaN(idOrUuid);
  const query = isNumeric
    ? `SELECT * FROM reviews WHERE id = ? LIMIT 1`
    : `SELECT * FROM reviews WHERE uuid = ? OR review_id = ? LIMIT 1`;

  const values = isNumeric ? [idOrUuid] : [idOrUuid, idOrUuid];
  const [rows] = await pool.query(query, values);

  if (!rows.length) return null;
  return rows[0];
};

const updateReview = async (id, updateData) => {
  const {
    product_id,
    product_code,
    product_name,
    product_image,
    reviewer_name,
    reviewer_email,
    rating,
    title,
    comment,
    review_photo,
    status,
    updated_by = "Admin",
  } = updateData;

  const query = `
    UPDATE reviews
    SET product_id = ?,
        product_code = ?,
        product_name = ?,
        product_image = ?,
        reviewer_name = ?,
        reviewer_email = ?,
        rating = ?,
        title = ?,
        comment = ?,
        review_photo = ?,
        status = ?,
        updated_by = ?
    WHERE id = ? OR uuid = ? OR review_id = ?
  `;

  const values = [
    product_id ? Number(product_id) : null,
    product_code,
    product_name,
    product_image || null,
    reviewer_name,
    reviewer_email || null,
    Number(rating || 5),
    title || null,
    comment,
    review_photo || null,
    status || "Published",
    updated_by || "Admin",
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

const deleteReview = async (idOrUuid) => {
  const pool = getDB();
  const isNumeric = !isNaN(idOrUuid);
  const query = isNumeric
    ? `DELETE FROM reviews WHERE id = ?`
    : `DELETE FROM reviews WHERE uuid = ? OR review_id = ?`;

  const values = isNumeric ? [idOrUuid] : [idOrUuid, idOrUuid];
  const [result] = await pool.query(query, values);

  return {
    affectedRows: result.affectedRows,
    id: idOrUuid,
  };
};

const getReviewStats = async () => {
  const pool = getDB();
  const query = `
    SELECT 
      COUNT(*) AS total_reviews,
      COALESCE(AVG(rating), 0) AS avg_rating,
      SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS five_star_count,
      SUM(CASE WHEN review_photo IS NOT NULL AND review_photo != '' THEN 1 ELSE 0 END) AS photo_reviews_count,
      SUM(CASE WHEN status = 'Published' THEN 1 ELSE 0 END) AS published_count
    FROM reviews
  `;

  const [rows] = await pool.query(query);
  const stat = rows[0] || {};

  return {
    total_reviews: Number(stat.total_reviews || 0),
    avg_rating: Number(Number(stat.avg_rating || 0).toFixed(1)),
    five_star_count: Number(stat.five_star_count || 0),
    photo_reviews_count: Number(stat.photo_reviews_count || 0),
    published_count: Number(stat.published_count || 0),
  };
};

module.exports = {
  getNextReviewId,
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getReviewStats,
};
