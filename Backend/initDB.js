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
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL UNIQUE,
        full_name VARCHAR(255) NOT NULL,
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

    await connection.query(createTableQuery);
    console.log("✅ Users table created successfully!");

    await connection.end();
    console.log("✅ Database initialization complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error initializing database:", error.message);
    process.exit(1);
  }
}

initializeDatabase();
