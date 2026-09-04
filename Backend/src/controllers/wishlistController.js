const wishlistModule = require("../modules/wishlistModule");

const getWishlistByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });
    const items = await wishlistModule.getWishlistByUser(userId);
    return res.status(200).json({ success: true, data: items, wishlist: items });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve wishlist" });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { user_id, product_id } = req.body;
    if (!user_id || !product_id) {
      return res.status(400).json({ success: false, message: "User ID and product ID are required" });
    }
    const items = await wishlistModule.addToWishlist(req.body);
    return res.status(201).json({ success: true, message: "Added to favorites", data: items });
  } catch (error) {
    console.error("Add wishlist error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to add favorite" });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const removed = await wishlistModule.removeFromWishlist(userId, productId);
    if (!removed) return res.status(404).json({ success: false, message: "Favorite not found" });
    return res.status(200).json({ success: true, message: "Removed from favorites" });
  } catch (error) {
    console.error("Remove wishlist error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to remove favorite" });
  }
};

module.exports = { getWishlistByUser, addToWishlist, removeFromWishlist };
