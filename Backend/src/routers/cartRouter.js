const express = require("express");
const cartController = require("../controllers/cartController");

const router = express.Router();

router.get("/:userId", cartController.getCartByUser);
router.post("/", cartController.addToCart);
router.put("/:id", cartController.updateCartItem);
router.delete("/clear/:userId", cartController.clearCart);
router.delete("/:id", cartController.removeFromCart);

module.exports = router;
