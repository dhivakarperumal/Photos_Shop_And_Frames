const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

/**
 * User Routes
 */

// Public routes
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

// Protected routes (require authentication)
router.get("/profile/:userId", userController.getUserProfile);
router.put("/profile/:userId", userController.updateUserProfile);

// Admin routes
router.get("/", userController.getAllUsers);
router.delete("/:userId", userController.deleteUser);

module.exports = router;
