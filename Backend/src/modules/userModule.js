const { getDB } = require("../config/db");

/**
 * User Module - Handles all user-related database operations
 */

// Create a new user
const createUser = async (userData) => {
  const {
    user_id,
    username,
    mobile_number,
    email,
    password,
    profile_image,
    role,
    status,
    created_by,
  } = userData;

  const query = `
    INSERT INTO users 
    (user_id, username, mobile_number, email, password, profile_image, role, status, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  const values = [
    user_id,
    username,
    mobile_number || null,
    email,
    password,
    profile_image || null,
    role || "user",
    status || "Active",
    created_by || null,
  ];

  try {
    const pool = getDB();
    const [result] = await pool.query(query, values);
    return {
      success: true,
      message: "User created successfully",
      userId: result.insertId,
    };
  } catch (error) {
    throw error;
  }
};

// Get user by email
const getUserByEmail = async (email) => {
  const query = "SELECT * FROM users WHERE email = ?";
  try {
    const pool = getDB();
    const [rows] = await pool.query(query, [email]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    throw error;
  }
};

// Get user by user_id
const getUserById = async (user_id) => {
  const query = "SELECT * FROM users WHERE user_id = ?";
  try {
    const pool = getDB();
    const [rows] = await pool.query(query, [user_id]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    throw error;
  }
};

const getUserByDatabaseId = async (id) => {
  const query = "SELECT id, user_id, username, mobile_number, email, profile_image, role, status, created_at, updated_at FROM users WHERE id = ?";
  const pool = getDB();
  const [rows] = await pool.query(query, [id]);
  return rows.length > 0 ? rows[0] : null;
};

const getUserByIdentifier = async (identifier) => {
  const query = "SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1";
  try {
    const pool = getDB();
    const [rows] = await pool.query(query, [identifier, identifier]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    throw error;
  }
};

// Get all users
const getAllUsers = async () => {
  const query = "SELECT id, user_id, username, mobile_number, email, role, status, created_at FROM users";
  try {
    const pool = getDB();
    const [rows] = await pool.query(query);
    return rows;
  } catch (error) {
    throw error;
  }
};

// Update user
const updateUser = async (userId, updateData) => {
  const {
    username,
    mobile_number,
    email,
    profile_image,
    role,
    status,
    updated_by,
  } = updateData;

  const query = `
    UPDATE users 
    SET username = ?, mobile_number = ?, email = ?, profile_image = ?, 
        role = ?, status = ?, updated_by = ?, updated_at = NOW()
    WHERE id = ?
  `;

  const values = [
    username,
    mobile_number || null,
    email,
    profile_image || null,
    role,
    status,
    updated_by || null,
    userId,
  ];

  try {
    const pool = getDB();
    const [result] = await pool.query(query, values);
    return {
      success: true,
      message: "User updated successfully",
      affectedRows: result.affectedRows,
    };
  } catch (error) {
    throw error;
  }
};

// Delete user
const deleteUser = async (userId) => {
  const query = "DELETE FROM users WHERE id = ?";
  try {
    const pool = getDB();
    const [result] = await pool.query(query, [userId]);
    return {
      success: true,
      message: "User deleted successfully",
      affectedRows: result.affectedRows,
    };
  } catch (error) {
    throw error;
  }
};

// Check if user exists by email
const isEmailExists = async (email) => {
  const query = "SELECT id FROM users WHERE email = ?";
  try {
    const pool = getDB();
    const [rows] = await pool.query(query, [email]);
    return rows.length > 0;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserByIdentifier,
  getUserById,
  getUserByDatabaseId,
  getAllUsers,
  updateUser,
  deleteUser,
  isEmailExists,
};
