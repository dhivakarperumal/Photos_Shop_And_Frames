const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { initDB } = require("./src/config/db");

/**
 * Seed Script - Create Initial Admin User
 * Run with: node seed.js
 */

async function seedAdminUser() {
  try {
    const pool = await initDB();

    // Admin user data
    const user_id = uuidv4();
    const username = "Admin";
    const email = "admin@gmail.com";
    const password = "admin@123";
    const mobile_number = "1234567890";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if admin already exists
    const query = "SELECT id FROM users WHERE email = ?";
    const [existingUser] = await pool.query(query, [email]);

    if (existingUser.length > 0) {
      console.log("✅ Admin user already exists!");
      process.exit(0);
    }

    // Insert admin user
    const insertQuery = `
      INSERT INTO users 
      (user_id, username, mobile_number, email, password, profile_image, role, status, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [
      user_id,
      username,
      mobile_number,
      email,
      hashedPassword,
      null,
      "admin",
      "Active",
      "system",
    ];

    const [result] = await pool.query(insertQuery, values);

    console.log("✅ Admin user created successfully!");
    console.log({
      id: result.insertId,
      user_id,
      username,
      email,
      mobile: mobile_number,
      role: "admin",
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    process.exit(1);
  }
}

seedAdminUser();
