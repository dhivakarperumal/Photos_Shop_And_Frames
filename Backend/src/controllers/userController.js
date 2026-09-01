const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const userModule = require("../modules/userModule");

/**
 * User Controller - Handles all user-related API requests
 */

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { username, email, password, mobile_number, profile_image } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "username, email, and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await userModule.isEmailExists(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique user_id
    const user_id = uuidv4();

    // Create user object
    const userData = {
      user_id,
      username,
      email,
      password: hashedPassword,
      mobile_number: mobile_number || null,
      profile_image: profile_image || null,
      role: "user",
      status: "Active",
      created_by: "system",
    };

    // Create user in database
    const result = await userModule.createUser(userData);

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.userId, email, role: "user" },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        userId: result.userId,
        user_id,
        email,
        username,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Get user by email
    const user = await userModule.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is active
    if (user.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "User account is not active",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        userId: user.id,
        user_id: user.user_id,
        email: user.email,
        username: user.username,
        role: user.role,
        profile_image: user.profile_image,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.userId || req.params.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await userModule.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve user profile",
    });
  }
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await userModule.getAllUsers();
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve users",
    });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?.userId || req.params.userId;
    const updateData = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Prevent updating sensitive fields
    if (updateData.password || updateData.role || updateData.email) {
      return res.status(403).json({
        success: false,
        message: "Cannot update password, role, or email through this endpoint",
      });
    }

    const result = await userModule.updateUser(userId, {
      ...updateData,
      updated_by: req.user?.email || "system",
    });

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update user profile",
    });
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const result = await userModule.deleteUser(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete user",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
  updateUserProfile,
  deleteUser,
};
