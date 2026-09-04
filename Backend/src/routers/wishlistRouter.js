const express = require("express");
const wishlistController = require("../controllers/wishlistController");

const router = express.Router();

router.get("/:userId", wishlistController.getWishlistByUser);
router.post("/", wishlistController.addToWishlist);
router.delete("/:userId/:productId", wishlistController.removeFromWishlist);

module.exports = router;
