const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { ensureDatabaseSchema } = require("./src/config/db");

/**
 * Database Initialization Script
 * Creates the users, categories, and albums tables with the schema used by the app.
 * Run with: node initDB.js
 */

async function initializeDatabase() {
  try {
    console.log("✅ Connected to database");
    await ensureDatabaseSchema();
    console.log("✅ Database initialization complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error initializing database:", error.message);
    process.exit(1);
  }
}

initializeDatabase();
