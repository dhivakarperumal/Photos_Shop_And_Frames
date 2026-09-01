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
};

let pool;

async function initDB() {
  if (pool) return pool;

  pool = mysql.createPool(dbConfig);

  try {
    const connection = await pool.getConnection();
    console.log("MySQL connected successfully.");
    connection.release();
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

module.exports = { initDB, getDB };
