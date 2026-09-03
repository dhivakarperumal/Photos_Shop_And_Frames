const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mysql = require("mysql2/promise");

async function addColumns() {
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

    // Add columns to products table
    console.log("Adding columns to products table...");
    try {
      await connection.query(
        `ALTER TABLE products ADD COLUMN created_by VARCHAR(100)`
      );
      console.log("✅ Added created_by to products table");
    } catch (error) {
      if (error.code === "ER_DUP_FIELDNAME") {
        console.log("ℹ️  created_by already exists in products table");
      } else {
        throw error;
      }
    }

    try {
      await connection.query(
        `ALTER TABLE products ADD COLUMN updated_by VARCHAR(100)`
      );
      console.log("✅ Added updated_by to products table");
    } catch (error) {
      if (error.code === "ER_DUP_FIELDNAME") {
        console.log("ℹ️  updated_by already exists in products table");
      } else {
        throw error;
      }
    }

    // Add columns to orders table
    console.log("\nAdding columns to orders table...");
    try {
      await connection.query(
        `ALTER TABLE orders ADD COLUMN order_time VARCHAR(20) DEFAULT '00:00'`
      );
      console.log("✅ Added order_time to orders table");
    } catch (error) {
      if (error.code === "ER_DUP_FIELDNAME") {
        console.log("ℹ️  order_time already exists in orders table");
      } else {
        throw error;
      }
    }

    for (const column of [
      "created_by VARCHAR(255) NULL",
      "updated_by VARCHAR(255) NULL",
    ]) {
      const columnName = column.split(" ")[0];
      try {
        await connection.query(`ALTER TABLE orders ADD COLUMN ${column}`);
        console.log(`✅ Added ${columnName} to orders table`);
      } catch (error) {
        if (error.code === "ER_DUP_FIELDNAME") {
          console.log(`ℹ️  ${columnName} already exists in orders table`);
        } else {
          throw error;
        }
      }
    }

    // Add columns to order_items table
    console.log("\nAdding columns to order_items table...");
    try {
      await connection.query(
        `ALTER TABLE order_items ADD COLUMN product_image VARCHAR(500) DEFAULT ''`
      );
      console.log("✅ Added product_image to order_items table");
    } catch (error) {
      if (error.code === "ER_DUP_FIELDNAME") {
        console.log("ℹ️  product_image already exists in order_items table");
      } else {
        throw error;
      }
    }

    for (const column of [
      "created_by VARCHAR(255) NULL",
      "updated_by VARCHAR(255) NULL",
      "created_at DATETIME DEFAULT CURRENT_TIMESTAMP",
      "updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
    ]) {
      const columnName = column.split(" ")[0];
      try {
        await connection.query(`ALTER TABLE order_items ADD COLUMN ${column}`);
        console.log(`✅ Added ${columnName} to order_items table`);
      } catch (error) {
        if (error.code === "ER_DUP_FIELDNAME") {
          console.log(`ℹ️  ${columnName} already exists in order_items table`);
        } else {
          throw error;
        }
      }
    }

    for (const table of ["gallery_albums", "customized_photos", "coupons", "carts", "banners"]) {
      console.log(`\nAdding audit columns to ${table} table...`);
      for (const column of [
        "created_by VARCHAR(255) NULL",
        "updated_by VARCHAR(255) NULL",
      ]) {
        const columnName = column.split(" ")[0];
        try {
          await connection.query(`ALTER TABLE ${table} ADD COLUMN ${column}`);
          console.log(`✅ Added ${columnName} to ${table} table`);
        } catch (error) {
          if (error.code === "ER_DUP_FIELDNAME") {
            console.log(`ℹ️  ${columnName} already exists in ${table} table`);
          } else {
            throw error;
          }
        }
      }
    }

    // Add columns to frames table
    console.log("\nAdding columns to frames table...");
    try {
      await connection.query(
        `ALTER TABLE frames ADD COLUMN created_by VARCHAR(100)`
      );
      console.log("✅ Added created_by to frames table");
    } catch (error) {
      if (error.code === "ER_DUP_FIELDNAME") {
        console.log("ℹ️  created_by already exists in frames table");
      } else {
        throw error;
      }
    }

    try {
      await connection.query(
        `ALTER TABLE frames ADD COLUMN updated_by VARCHAR(100)`
      );
      console.log("✅ Added updated_by to frames table");
    } catch (error) {
      if (error.code === "ER_DUP_FIELDNAME") {
        console.log("ℹ️  updated_by already exists in frames table");
      } else {
        throw error;
      }
    }

    await connection.end();
    console.log("\n✅ Database migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

addColumns();
