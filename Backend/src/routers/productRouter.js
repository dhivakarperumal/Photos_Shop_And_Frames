const express = require("express");
const productController = require("../controllers/productController");

const router = express.Router();

/**
 * Product Routes
 */
router.get("/next-id", productController.getNextProductIdController);
router.post("/", productController.createProduct);
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
