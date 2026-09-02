const { getDB } = require("../config/db");

/**
 * Frame Module
 * Purely for Frame Templates (Background Image + Photo Slot Layouts + Orientation)
 */

const createFrame = async (frameData) => {
  const {
    uuid,
    frame_name,
    orientation,
    frame_image,
    photo_slots,
    status = "Active",
  } = frameData;

  const query = `
    INSERT INTO frames (
      uuid,
      frame_name,
      orientation,
      frame_image,
      photo_slots,
      status
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [
    uuid,
    frame_name,
    orientation || "Portrait",
    frame_image,
    JSON.stringify(photo_slots || []),
    status || "Active",
  ];

  const pool = getDB();
  const [result] = await pool.query(query, values);

  return {
    id: result.insertId,
    uuid,
    frame_name,
    orientation,
    frame_image,
    photo_slots: photo_slots || [],
    status: status || "Active",
  };
};

const getAllFrames = async (filters = {}) => {
  const pool = getDB();
  let query = `SELECT * FROM frames WHERE 1=1`;
  const values = [];

  if (filters.orientation) {
    query += ` AND LOWER(orientation) = LOWER(?)`;
    values.push(filters.orientation);
  }

  if (filters.status) {
    query += ` AND status = ?`;
    values.push(filters.status);
  }

  query += ` ORDER BY created_at DESC`;

  const [rows] = await pool.query(query, values);

  return rows.map((row) => ({
    ...row,
    photo_slots: row.photo_slots
      ? typeof row.photo_slots === "string"
        ? JSON.parse(row.photo_slots)
        : row.photo_slots
      : [],
  }));
};

const getFrameById = async (idOrUuid) => {
  const pool = getDB();
  const isNumeric = !isNaN(idOrUuid);
  const query = isNumeric
    ? `SELECT * FROM frames WHERE id = ? LIMIT 1`
    : `SELECT * FROM frames WHERE uuid = ? LIMIT 1`;

  const [rows] = await pool.query(query, [idOrUuid]);

  if (!rows.length) return null;

  const row = rows[0];
  return {
    ...row,
    photo_slots: row.photo_slots
      ? typeof row.photo_slots === "string"
        ? JSON.parse(row.photo_slots)
        : row.photo_slots
      : [],
  };
};

const updateFrame = async (id, updateData) => {
  const {
    frame_name,
    orientation,
    frame_image,
    photo_slots,
    status,
  } = updateData;

  const query = `
    UPDATE frames
    SET frame_name = ?,
        orientation = ?,
        frame_image = ?,
        photo_slots = ?,
        status = ?
    WHERE id = ? OR uuid = ?
  `;

  const values = [
    frame_name,
    orientation,
    frame_image,
    JSON.stringify(photo_slots || []),
    status || "Active",
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

const deleteFrame = async (idOrUuid) => {
  const pool = getDB();
  const isNumeric = !isNaN(idOrUuid);
  const query = isNumeric
    ? `DELETE FROM frames WHERE id = ?`
    : `DELETE FROM frames WHERE uuid = ?`;

  const [result] = await pool.query(query, [idOrUuid]);

  return {
    affectedRows: result.affectedRows,
    id: idOrUuid,
  };
};

module.exports = {
  createFrame,
  getAllFrames,
  getFrameById,
  updateFrame,
  deleteFrame,
};
