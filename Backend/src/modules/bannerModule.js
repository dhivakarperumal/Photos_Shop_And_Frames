const { getDB } = require("../config/db");

const ensureBannersTable = async () => {
  const pool = getDB();
  const query = `
    CREATE TABLE IF NOT EXISTS banners (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      subtitle VARCHAR(255) DEFAULT '',
      description TEXT DEFAULT '',
      image VARCHAR(500) DEFAULT '',
      mobile_image VARCHAR(500) DEFAULT '',
      link VARCHAR(500) DEFAULT '',
      type VARCHAR(50) NOT NULL DEFAULT 'hero',
      active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  await pool.query(query);
};

const getAllBanners = async () => {
  await ensureBannersTable();
  const pool = getDB();
  const [rows] = await pool.query(
    `SELECT * FROM banners ORDER BY created_at DESC, id DESC`
  );
  return rows;
};

const createBanner = async (bannerData) => {
  await ensureBannersTable();
  const pool = getDB();
  const {
    title,
    subtitle = "",
    description = "",
    image = "",
    mobile_image = "",
    link = "",
    type = "hero",
    active = true,
  } = bannerData;

  const query = `
    INSERT INTO banners (title, subtitle, description, image, mobile_image, link, type, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await pool.query(query, [
    title || "",
    subtitle || "",
    description || "",
    image || "",
    mobile_image || "",
    link || "",
    type || "hero",
    active ? 1 : 0,
  ]);

  return {
    id: result.insertId,
    title: title || "",
    subtitle: subtitle || "",
    description: description || "",
    image: image || "",
    mobile_image: mobile_image || "",
    link: link || "",
    type: type || "hero",
    active: Boolean(active),
  };
};

const updateBanner = async (id, bannerData) => {
  await ensureBannersTable();
  const pool = getDB();
  const {
    title,
    subtitle = "",
    description = "",
    image = "",
    mobile_image = "",
    link = "",
    type = "hero",
    active = true,
  } = bannerData;

  const query = `
    UPDATE banners
    SET title = ?, subtitle = ?, description = ?, image = ?, mobile_image = ?, link = ?, type = ?, active = ?
    WHERE id = ?
  `;

  const [result] = await pool.query(query, [
    title || "",
    subtitle || "",
    description || "",
    image || "",
    mobile_image || "",
    link || "",
    type || "hero",
    active ? 1 : 0,
    id,
  ]);

  return {
    affectedRows: result.affectedRows,
    id,
  };
};

const deleteBanner = async (id) => {
  await ensureBannersTable();
  const pool = getDB();
  const [result] = await pool.query(`DELETE FROM banners WHERE id = ?`, [id]);

  return {
    affectedRows: result.affectedRows,
    id,
  };
};

module.exports = {
  ensureBannersTable,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
