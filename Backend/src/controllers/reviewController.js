const reviewModule = require("../modules/reviewModule");

const getNextReviewIdController = async (req, res) => {
  try {
    const nextReviewId = await reviewModule.getNextReviewId();
    res.status(200).json({
      success: true,
      data: nextReviewId,
    });
  } catch (error) {
    console.error("Get next review id error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate review ID",
    });
  }
};

const createReview = async (req, res) => {
  try {
    const {
      uuid,
      review_id,
      product_id,
      product_code,
      product_name,
      product_image,
      reviewer_name,
      reviewer_email,
      rating,
      title,
      comment,
      review_photo,
      status,
      created_by,
      updated_by,
    } = req.body;

    if (!product_name || !product_code) {
      return res.status(400).json({
        success: false,
        message: "Product selection is required",
      });
    }

    if (!reviewer_name || !reviewer_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reviewer name is required",
      });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: "Review comment is required",
      });
    }

    const finalReviewId = review_id || (await reviewModule.getNextReviewId());

    const payload = {
      uuid: uuid || `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
      review_id: finalReviewId,
      product_id: product_id || null,
      product_code: product_code.trim(),
      product_name: product_name.trim(),
      product_image: product_image || null,
      reviewer_name: reviewer_name.trim(),
      reviewer_email: reviewer_email ? reviewer_email.trim() : null,
      rating: Number(rating || 5),
      title: title ? title.trim() : null,
      comment: comment.trim(),
      review_photo: review_photo || null,
      status: status || "Published",
      created_by: created_by || "Admin",
      updated_by: updated_by || created_by || "Admin",
    };

    const result = await reviewModule.createReview(payload);

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create review",
    });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const { product_id, rating, status, search } = req.query;
    const reviews = await reviewModule.getAllReviews({
      product_id,
      rating,
      status,
      search,
    });

    res.status(200).json({
      success: true,
      message: "Reviews retrieved successfully",
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve reviews",
    });
  }
};

const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await reviewModule.getReviewById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Review retrieved successfully",
      data: review,
    });
  } catch (error) {
    console.error("Get review error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve review",
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await reviewModule.updateReview(id, req.body);

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update review",
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await reviewModule.deleteReview(id);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete review",
    });
  }
};

const getReviewStatsController = async (req, res) => {
  try {
    const stats = await reviewModule.getReviewStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get review stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve review stats",
    });
  }
};

module.exports = {
  getNextReviewIdController,
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getReviewStatsController,
};
