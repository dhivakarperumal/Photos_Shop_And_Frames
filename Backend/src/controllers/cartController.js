const cartModule = require("../modules/cartModule");

const getCartByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const items = await cartModule.getCartByUser(userId);
    res.status(200).json({
      success: true,
      data: items,
      cart: items,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve cart items",
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const {
      user_id,
      product_id,
      customization_id,
      size,
      variant_size,
      price,
      quantity = 1,
      slot_photos,
      preview_image,
    } = req.body;

    const finalUserId = user_id || req.user?.user_id || req.user?.id;
    if (!finalUserId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required for cart",
      });
    }

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const finalSize = size || variant_size || "Standard";
    const finalPrice = Number(price || 0);

    const result = await cartModule.addToCart({
      user_id: finalUserId,
      product_id,
      customization_id: customization_id || null,
      size: finalSize,
      price: finalPrice,
      quantity: Number(quantity) || 1,
      slot_photos: slot_photos || null,
      preview_image: preview_image || null,
    });

    res.status(201).json({
      success: true,
      message: "Item added to cart successfully",
      data: result,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add item to cart",
    });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, price } = req.body;

    if (!quantity || Number(quantity) < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const updated = await cartModule.updateCartItem(id, quantity, price);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cart item updated",
    });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update cart item",
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await cartModule.removeFromCart(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("Remove cart error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to remove item",
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    await cartModule.clearCart(userId);

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to clear cart",
    });
  }
};

module.exports = {
  getCartByUser,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
