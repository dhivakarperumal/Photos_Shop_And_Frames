const { getDB } = require("../config/db");

// Auto-initialize tables
const initGalleryTables = async () => {
  try {
    const pool = getDB();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gallery_albums (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        album_id VARCHAR(255) NOT NULL UNIQUE,
        legacy_album_id VARCHAR(255) UNIQUE,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Active',
        sort_order INT DEFAULT 1,
        short_description TEXT,
        description TEXT,
        cover_image VARCHAR(255),
        meta_title VARCHAR(255),
        meta_description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      ALTER TABLE gallery_albums
      ADD COLUMN IF NOT EXISTS legacy_album_id VARCHAR(255) UNIQUE
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gallery_photos (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        album_id VARCHAR(255) NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (album_id) REFERENCES gallery_albums(album_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    await migrateLegacyGalleryIds();
    console.log("✅ Gallery tables ready");
  } catch (error) {
    console.error("❌ Error initializing gallery tables:", error.message);
  }
};

setTimeout(initGalleryTables, 2000); // Give DB time to connect

const migrateLegacyGalleryIds = async () => {
  const pool = getDB();
  const [legacyAlbums] = await pool.query(
    "SELECT album_id FROM gallery_albums WHERE album_id NOT REGEXP '^GAL[0-9]+$' ORDER BY id ASC"
  );
  if (!legacyAlbums.length) return;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");

    const [galleryAlbums] = await connection.query(
      "SELECT album_id FROM gallery_albums WHERE album_id REGEXP '^GAL[0-9]+$' ORDER BY CAST(SUBSTRING(album_id, 4) AS UNSIGNED) DESC LIMIT 1"
    );
    let nextNumber = Number(String(galleryAlbums?.[0]?.album_id || "GAL000").replace(/\D/g, "")) || 0;

    for (const legacyAlbum of legacyAlbums) {
      const legacyId = legacyAlbum.album_id;
      const galleryId = `GAL${String(++nextNumber).padStart(3, "0")}`;
      await connection.query("UPDATE gallery_photos SET album_id = ? WHERE album_id = ?", [galleryId, legacyId]);
      await connection.query(
        "UPDATE gallery_albums SET legacy_album_id = ?, album_id = ? WHERE album_id = ?",
        [legacyId, galleryId, legacyId]
      );
    }

    await connection.query("SET FOREIGN_KEY_CHECKS = 1");
    await connection.commit();
    console.log(`✅ Migrated ${legacyAlbums.length} legacy gallery ID(s)`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");
    connection.release();
  }
};

const getNextGalleryId = async () => {
  const query = `
    SELECT album_id
    FROM gallery_albums
    WHERE album_id REGEXP '^GAL[0-9]+$'
    ORDER BY CAST(SUBSTRING(album_id, 4) AS UNSIGNED) DESC
    LIMIT 1
  `;

  const pool = getDB();
  const [rows] = await pool.query(query);
  const lastId = rows?.[0]?.album_id || "GAL000";
  const lastNumber = Number(String(lastId).replace(/\D/g, "")) || 0;

  return `GAL${String(lastNumber + 1).padStart(3, "0")}`;
};

const resolveGalleryId = async (galleryId) => {
  const pool = getDB();
  const [rows] = await pool.query(
    "SELECT album_id FROM gallery_albums WHERE album_id = ? OR legacy_album_id = ? LIMIT 1",
    [galleryId, galleryId]
  );
  return rows?.[0]?.album_id || galleryId;
};

const createAlbum = async (albumData, photos = []) => {
  const album_id = await getNextGalleryId();
  const {
    title,
    category,
    status,
    sort_order,
    short_description,
    description,
    cover_image,
    meta_title,
    meta_description,
  } = albumData;

  const query = `
    INSERT INTO gallery_albums 
    (album_id, title, category, status, sort_order, short_description, description, cover_image, meta_title, meta_description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    album_id,
    title,
    category || null,
    status || 'Active',
    sort_order || 1,
    short_description || null,
    description || null,
    cover_image || null,
    meta_title || null,
    meta_description || null,
  ];

  try {
    const pool = getDB();
    await pool.query(query, values);

    // Insert photos if any
    if (photos && photos.length > 0) {
      const photoQuery = `INSERT INTO gallery_photos (album_id, image_url) VALUES ?`;
      const photoValues = photos.map(url => [album_id, url]);
      await pool.query(photoQuery, [photoValues]);
    }

    return { success: true, album_id, message: "Album created successfully" };
  } catch (error) {
    throw error;
  }
};

const getAllAlbums = async () => {
  const query = `
    SELECT a.*, COUNT(p.id) as photo_count 
    FROM gallery_albums a
    LEFT JOIN gallery_photos p ON a.album_id = p.album_id
    GROUP BY a.album_id
    ORDER BY a.sort_order ASC, a.created_at DESC
  `;
  try {
    const pool = getDB();
    const [rows] = await pool.query(query);
    return rows;
  } catch (error) {
    throw error;
  }
};

const getAlbumById = async (albumId) => {
  const pool = getDB();
  const [albums] = await pool.query(
    "SELECT * FROM gallery_albums WHERE album_id = ? OR legacy_album_id = ? LIMIT 1",
    [albumId, albumId]
  );
  if (!albums.length) return null;

  const [photos] = await pool.query("SELECT image_url FROM gallery_photos WHERE album_id = ? ORDER BY id ASC", [albums[0].album_id]);
  return { ...albums[0], photos: photos.map((photo) => photo.image_url) };
};

const updateAlbum = async (albumId, albumData, photos) => {
  const {
    title,
    category,
    status,
    sort_order,
    short_description,
    description,
    cover_image,
    meta_title,
    meta_description,
  } = albumData;
  const pool = getDB();
  const resolvedAlbumId = await resolveGalleryId(albumId);
  const [result] = await pool.query(
    `UPDATE gallery_albums
     SET title = ?, category = ?, status = ?, sort_order = ?, short_description = ?,
         description = ?, cover_image = ?, meta_title = ?, meta_description = ?
     WHERE album_id = ?`,
    [title, category || null, status || "Active", sort_order || 1, short_description || null,
      description || null, cover_image || null, meta_title || null, meta_description || null, resolvedAlbumId]
  );

  if (!result.affectedRows) return null;

  if (Array.isArray(photos)) {
    await pool.query("DELETE FROM gallery_photos WHERE album_id = ?", [resolvedAlbumId]);
    if (photos.length) {
      await pool.query("INSERT INTO gallery_photos (album_id, image_url) VALUES ?", [photos.map((url) => [resolvedAlbumId, url])]);
    }
  }

  return getAlbumById(albumId);
};

const deleteAlbum = async (albumId) => {
  const pool = getDB();
  const resolvedAlbumId = await resolveGalleryId(albumId);
  const [result] = await pool.query("DELETE FROM gallery_albums WHERE album_id = ?", [resolvedAlbumId]);
  return result.affectedRows > 0;
};

module.exports = {
  getNextGalleryId,
  createAlbum,
  getAllAlbums,
  getAlbumById,
  updateAlbum,
  deleteAlbum,
};
