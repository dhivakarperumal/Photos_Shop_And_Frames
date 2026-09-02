const express = require("express");
const reviewController = require("../controllers/reviewController");

const router = express.Router();

/**
 * Review Routes
 */
router.get("/next-id", reviewController.getNextReviewIdController);
router.get("/stats", reviewController.getReviewStatsController);
router.post("/", reviewController.createReview);
router.get("/", reviewController.getAllReviews);
router.get("/:id", reviewController.getReviewById);
router.put("/:id", reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);

module.exports = router;
