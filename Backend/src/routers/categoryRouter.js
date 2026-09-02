const express = require("express");
const categoryController = require("../controllers/categoryController");

const router = express.Router();

router.get("/next-id", categoryController.getNextCategoryIdController);
router.get("/", categoryController.getAllCategories);
router.get("/:categoryId", categoryController.getCategoryById);
router.post("/", categoryController.createCategory);
router.put("/:categoryId", categoryController.updateCategory);
router.delete("/:categoryId", categoryController.deleteCategory);

module.exports = router;
