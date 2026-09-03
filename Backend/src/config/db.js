const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "qtechx_db",
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  supportBigNumbers: true,
  bigNumberStrings: true,
};

let pool;

async function ensureDatabaseSchema() {
  const connection = await mysql.createConnection(dbConfig);

  try {
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

    const createAlbumsTableQuery = `
      CREATE TABLE IF NOT EXISTS albums (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL UNIQUE,
        product_name VARCHAR(255) NOT NULL,
        product_code VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        sub_category VARCHAR(255),
        brand VARCHAR(255),
        album_type VARCHAR(255),
        occasion VARCHAR(255),
        theme VARCHAR(255),
        size VARCHAR(255),
        width VARCHAR(255),
        height VARCHAR(255),
        orientation VARCHAR(50),
        total_pages INT DEFAULT 0,
        sheet_count INT DEFAULT 0,
        page_material VARCHAR(255),
        page_thickness VARCHAR(255),
        cover_type VARCHAR(255),
        cover_material VARCHAR(255),
        cover_finish VARCHAR(255),
        cover_color VARCHAR(255),
        printing_type VARCHAR(255),
        print_quality VARCHAR(255),
        printing_sides VARCHAR(255),
        binding_type VARCHAR(255),
        thumbnail_image VARCHAR(255),
        product_images JSON,
        cost_price DECIMAL(10,2) DEFAULT 0,
        selling_price DECIMAL(10,2) DEFAULT 0,
        discount_price DECIMAL(10,2) DEFAULT 0,
        discount_percentage DECIMAL(5,2) DEFAULT 0,
        stock_quantity INT DEFAULT 0,
        minimum_stock INT DEFAULT 0,
        stock_status VARCHAR(50) DEFAULT 'In Stock',
        short_description TEXT,
        description TEXT,
        customization_available BOOLEAN DEFAULT FALSE,
        customer_name_printing BOOLEAN DEFAULT FALSE,
        photo_upload_required BOOLEAN DEFAULT FALSE,
        custom_cover_design BOOLEAN DEFAULT FALSE,
        estimated_delivery_days INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'Active',
        featured_product BOOLEAN DEFAULT FALSE,
        meta_title VARCHAR(255),
        meta_description TEXT,
        keywords JSON,
        created_by VARCHAR(255),
        updated_by VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_product_id (product_id),
        KEY idx_category (category),
        KEY idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    const createCustomizedPhotosTableQuery = `
      CREATE TABLE IF NOT EXISTS customized_photos (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        customization_id VARCHAR(255) NOT NULL UNIQUE,
        user_id VARCHAR(255) NULL,
        product_id INT(11) NOT NULL,
        slot_photos JSON NOT NULL,
        preview_image VARCHAR(500) NULL,
        created_by VARCHAR(255) NULL,
        updated_by VARCHAR(255) NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_customization_id (customization_id),
        KEY idx_user_id (user_id),
        KEY idx_product_id (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    const createCartsTableQuery = `
      CREATE TABLE IF NOT EXISTS carts (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        product_id INT(11) NOT NULL,
        customization_id VARCHAR(255) NULL,
        size VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        quantity INT(11) NOT NULL DEFAULT 1,
        slot_photos JSON NULL,
        preview_image VARCHAR(500) NULL,
        created_by VARCHAR(255) NULL,
        updated_by VARCHAR(255) NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_user_id (user_id),
        KEY idx_product_id (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    const createOrdersTableQuery = `
      CREATE TABLE IF NOT EXISTS orders (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(100) NOT NULL UNIQUE,
        user_id VARCHAR(255) NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NULL,
        customer_phone VARCHAR(50) NOT NULL,
        shipping_address TEXT NOT NULL,
        billing_type VARCHAR(50) NOT NULL DEFAULT 'Online Order',
        order_date DATE NULL,
        city VARCHAR(100) NULL,
        state VARCHAR(100) NULL,
        pincode VARCHAR(20) NULL,
        total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        payment_method VARCHAR(50) NOT NULL DEFAULT 'Cash On Delivery',
        payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
        order_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
        shipped_at DATETIME NULL,
        docket_number VARCHAR(100) NULL,
        courier_name VARCHAR(255) NULL,
        notes TEXT NULL,
        created_by VARCHAR(255) NULL,
        updated_by VARCHAR(255) NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_user_id (user_id),
        KEY idx_order_status (order_status),
        KEY idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    const createOrderItemsTableQuery = `
      CREATE TABLE IF NOT EXISTS order_items (
        id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(100) NOT NULL,
        product_id INT(11) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        category VARCHAR(255) NULL,
        size VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        quantity INT(11) NOT NULL DEFAULT 1,
        total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        customization_id VARCHAR(255) NULL,
        slot_photos JSON NULL,
        product_image VARCHAR(500) NULL,
        frame_image VARCHAR(500) NULL,
        created_by VARCHAR(255) NULL,
        updated_by VARCHAR(255) NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_order_id (order_id),
        KEY idx_product_id (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    const createAddressesTableQuery = `
      CREATE TABLE IF NOT EXISTS addresses (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, address_id VARCHAR(255) NOT NULL UNIQUE,
        user_id VARCHAR(255), customer_id VARCHAR(255), order_id VARCHAR(255), address_type VARCHAR(50),
        customer_name VARCHAR(255), mobile_number VARCHAR(50), alternate_mobile VARCHAR(50),
        address_line1 TEXT, address_line2 TEXT, city VARCHAR(100), district VARCHAR(100), state VARCHAR(100),
        country VARCHAR(100), pincode VARCHAR(20), landmark VARCHAR(255), is_default BOOLEAN DEFAULT FALSE,
        status VARCHAR(50) DEFAULT 'Active', created_by VARCHAR(255), updated_by VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_addresses_order (order_id), KEY idx_addresses_customer (customer_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.query(createUsersTableQuery);
    await connection.query(createCategoriesTableQuery);
    await connection.query(createAlbumsTableQuery);
    await connection.query(createCustomizedPhotosTableQuery);
    await connection.query(createCartsTableQuery);
    try {
      await connection.query(
        `ALTER TABLE carts ADD COLUMN preview_image VARCHAR(500) NULL`
      );
    } catch (error) {
      if (error.code !== "ER_DUP_FIELDNAME") throw error;
    }
    await connection.query(createOrdersTableQuery);
    for (const column of [
      "order_date DATE NULL",
      "order_time VARCHAR(20) DEFAULT '00:00'",
    ]) {
      try {
        await connection.query(`ALTER TABLE orders ADD COLUMN ${column}`);
      } catch (error) {
        if (error.code !== "ER_DUP_FIELDNAME") throw error;
      }
    }
    try {
      await connection.query(
        `ALTER TABLE orders ADD COLUMN billing_type VARCHAR(50) NOT NULL DEFAULT 'Online Order'`
      );
    } catch (error) {
      if (error.code !== "ER_DUP_FIELDNAME") throw error;
    }
    for (const column of [
      "shipped_at DATETIME NULL",
      "docket_number VARCHAR(100) NULL",
      "courier_name VARCHAR(255) NULL",
    ]) {
      try {
        await connection.query(`ALTER TABLE orders ADD COLUMN ${column}`);
      } catch (error) {
        if (error.code !== "ER_DUP_FIELDNAME") throw error;
      }
    }
    await connection.query(createOrderItemsTableQuery);
    await connection.query(createAddressesTableQuery);
    console.log("✅ Database schema ready.");
  } finally {
    await connection.end();
  }
}

async function initDB() {
  if (pool) return pool;

  pool = mysql.createPool(dbConfig);

  try {
    const connection = await pool.getConnection();
    console.log("MySQL connected successfully.");
    connection.release();
    await ensureDatabaseSchema();
    return pool;
  } catch (error) {
    console.error("MySQL connection failed:", error.message);
    throw error;
  }
}

function getDB() {
  if (!pool) {
    throw new Error("Database not initialized. Call initDB() first.");
  }
  return pool;
}

module.exports = { initDB, getDB, ensureDatabaseSchema };
