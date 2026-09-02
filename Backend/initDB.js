const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mysql = require("mysql2/promise");

/**
 * Database Initialization Script
 * Creates the users table with proper schema
 * Run with: node initDB.js
 */

async function initializeDatabase() {
  const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "frame_shop_db",
    port: Number(process.env.DB_PORT || 3306),
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected to database");

    // Create users table
    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL UNIQUE,
        username VARCHAR(255) NOT NULL,
        mobile_number VARCHAR(50),
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        profile_image VARCHAR(255),
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        status VARCHAR(50) NOT NULL DEFAULT 'Active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by VARCHAR(255),
        updated_by VARCHAR(255),
        KEY idx_user_id (user_id),
        KEY idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.query(createUsersTableQuery);
    console.log("✅ Users table created successfully!");

    // Create categories table
    const createCategoriesTableQuery = `
      CREATE TABLE IF NOT EXISTS categories (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        category_id VARCHAR(255) NOT NULL UNIQUE,
        category_type VARCHAR(100) NOT NULL,
        category_name VARCHAR(255) NOT NULL,
        sub_categories JSON,
        description TEXT,
        category_image VARCHAR(255),
        sort_order INT DEFAULT 1,
        status VARCHAR(50) DEFAULT 'Active',
        created_by VARCHAR(255),
        updated_by VARCHAR(255),
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_category_id (category_id),
        KEY idx_category_type (category_type),
        KEY idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.query(createCategoriesTableQuery);
    console.log("✅ Categories table created successfully!");

    // Create frames table (Frame Templates & Slots only)
    const createFramesTableQuery = `
      CREATE TABLE IF NOT EXISTS frames (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        uuid VARCHAR(100) NOT NULL UNIQUE,
        frame_name VARCHAR(255) NOT NULL,
        orientation VARCHAR(50) NOT NULL DEFAULT 'Portrait',
        frame_image VARCHAR(255) NOT NULL,
        photo_slots JSON NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Active',
        created_by VARCHAR(100),
        updated_by VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_frame_orientation (orientation),
        KEY idx_frame_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.query(createFramesTableQuery);
    console.log("✅ Frames table created successfully!");

    // Create products table (Full Product Details + Size Variants + Frame Template Link + Slot Photos)
    const createProductsTableQuery = `
      CREATE TABLE IF NOT EXISTS products (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        uuid VARCHAR(100) NOT NULL UNIQUE,
        product_id VARCHAR(50) NOT NULL UNIQUE,
        product_name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        material_type VARCHAR(100) DEFAULT NULL,
        color VARCHAR(50) DEFAULT NULL,
        description TEXT,
        size_variants JSON NOT NULL,
        orientation VARCHAR(50) NOT NULL DEFAULT 'Portrait',
        frame_id INT(11) DEFAULT NULL,
        frame_data JSON DEFAULT NULL,
        slot_photos JSON DEFAULT NULL,
        product_images JSON DEFAULT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Active',
        created_by VARCHAR(100),
        updated_by VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_product_id (product_id),
        KEY idx_product_category (category),
        KEY idx_product_orientation (orientation),
        KEY idx_product_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.query(createProductsTableQuery);
    console.log("✅ Products table created successfully!");

    // Create reviews table
    const createReviewsTableQuery = `
      CREATE TABLE IF NOT EXISTS reviews (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        uuid VARCHAR(100) NOT NULL UNIQUE,
        review_id VARCHAR(50) NOT NULL UNIQUE,
        product_id INT(11) DEFAULT NULL,
        product_code VARCHAR(50) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        product_image VARCHAR(255) DEFAULT NULL,
        reviewer_name VARCHAR(255) NOT NULL,
        reviewer_email VARCHAR(255) DEFAULT NULL,
        rating INT(2) NOT NULL DEFAULT 5,
        title VARCHAR(255) DEFAULT NULL,
        comment TEXT NOT NULL,
        review_photo VARCHAR(255) DEFAULT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Published',
        created_by VARCHAR(100) DEFAULT 'Admin',
        updated_by VARCHAR(100) DEFAULT 'Admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_rev_product_id (product_id),
        KEY idx_rev_product_code (product_code),
        KEY idx_rev_rating (rating),
        KEY idx_rev_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.query(createReviewsTableQuery);
    console.log("✅ Reviews table created successfully!");

    await connection.end();
    console.log("✅ Database initialization complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error initializing database:", error.message);
    process.exit(1);
  }
}

initializeDatabase();
