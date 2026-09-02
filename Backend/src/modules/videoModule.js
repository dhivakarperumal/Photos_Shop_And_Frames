const { getDB } = require("../config/db");

const ensureVideosTable = async () => {
  const pool = getDB();
  const query = `
    CREATE TABLE IF NOT EXISTS videos (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      videoId VARCHAR(500) NOT NULL,
      thumbnail VARCHAR(500) DEFAULT '',
      type VARCHAR(50) NOT NULL DEFAULT 'youtube',
      active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  await pool.query(query);
};

const getAllVideos = async () => {
  await ensureVideosTable();
  const pool = getDB();
  const [rows] = await pool.query(
    `SELECT * FROM videos ORDER BY created_at DESC, id DESC`
  );
  return rows;
};

const createVideo = async (videoData) => {
  await ensureVideosTable();
  const pool = getDB();
  const { title, videoId, thumbnail = "", type = "youtube", active = true } = videoData;

  const query = `
    INSERT INTO videos (title, videoId, thumbnail, type, active)
    VALUES (?, ?, ?, ?, ?)
  `;

  const [result] = await pool.query(query, [
    title || "",
    videoId || "",
    thumbnail || "",
    type || "youtube",
    active ? 1 : 0,
  ]);

  return {
    id: result.insertId,
    title: title || "",
    videoId: videoId || "",
    thumbnail: thumbnail || "",
    type: type || "youtube",
    active: Boolean(active),
  };
};

const updateVideo = async (id, videoData) => {
  await ensureVideosTable();
  const pool = getDB();
  const { title, videoId, thumbnail = "", type = "youtube", active = true } = videoData;

  const query = `
    UPDATE videos
    SET title = ?, videoId = ?, thumbnail = ?, type = ?, active = ?
    WHERE id = ?
  `;

  const [result] = await pool.query(query, [
    title || "",
    videoId || "",
    thumbnail || "",
    type || "youtube",
    active ? 1 : 0,
    id,
  ]);

  return { affectedRows: result.affectedRows, id };
};

const deleteVideo = async (id) => {
  await ensureVideosTable();
  const pool = getDB();
  const [result] = await pool.query(`DELETE FROM videos WHERE id = ?`, [id]);
  return { affectedRows: result.affectedRows, id };
};

module.exports = {
  ensureVideosTable,
  getAllVideos,
  createVideo,
  updateVideo,
  deleteVideo,
};
