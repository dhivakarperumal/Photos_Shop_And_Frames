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

const updateUserByUserId = async (userId, updateData) => {
  const {
    username,
    mobile_number,
    profile_image,
    updated_by,
  } = updateData;
  const query = `
    UPDATE users
    SET username = ?, mobile_number = ?, profile_image = ?, updated_by = ?, updated_at = NOW()
    WHERE user_id = ?
  `;
  const pool = getDB();
  const [result] = await pool.query(query, [username, mobile_number || null, profile_image || null, updated_by || null, userId]);
  return { success: true, message: "User updated successfully", affectedRows: result.affectedRows };
};

const getLatestAddressByUserId = async (userId) => {
  const pool = getDB();
  const [rows] = await pool.query(
    `SELECT * FROM addresses WHERE user_id = ? OR customer_id = ? ORDER BY is_default DESC, updated_at DESC, id DESC LIMIT 1`,
    [userId, userId],
  );
  return rows[0] || null;
};

const saveAddressByUserId = async (userId, address) => {
  const pool = getDB();
  const existing = await getLatestAddressByUserId(userId);
  const values = [
    address.customer_name || "",
    address.mobile_number || "",
    address.address_line1 || "",
    address.address_line2 || "",
    address.city || "",
    address.district || "",
    address.state || "",
    address.country || "",
    address.pincode || "",
    address.landmark || "",
    userId,
  ];
  if (existing) {
    await pool.query(
      `UPDATE addresses SET customer_name = ?, mobile_number = ?, address_line1 = ?, address_line2 = ?, city = ?, district = ?, state = ?, country = ?, pincode = ?, landmark = ?, updated_at = NOW() WHERE id = ?`,
      [...values.slice(0, -1), existing.id],
    );
  } else {
    await pool.query(
      `INSERT INTO addresses (address_id, user_id, customer_id, address_type, customer_name, mobile_number, address_line1, address_line2, city, district, state, country, pincode, landmark, is_default, status, created_by, updated_by) VALUES (UUID(), ?, ?, 'Shipping', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, 'Active', ?, ?)`,
      [userId, userId, ...values.slice(0, -1), userId, userId],
    );
  }
  return getLatestAddressByUserId(userId);
};

const getPasswordHashByUserId = async (userId) => {
  const pool = getDB();
  const [rows] = await pool.query("SELECT password FROM users WHERE user_id = ? LIMIT 1", [userId]);
  return rows[0]?.password || null;
};

const updatePasswordByUserId = async (userId, password) => {
  const pool = getDB();
  await pool.query("UPDATE users SET password = ?, updated_at = NOW() WHERE user_id = ?", [password, userId]);
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
  updateUserByUserId,
  getLatestAddressByUserId,
  saveAddressByUserId,
  getPasswordHashByUserId,
  updatePasswordByUserId,
  deleteUser,
  isEmailExists,
};
