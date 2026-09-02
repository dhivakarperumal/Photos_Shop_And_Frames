const categoryModule = require("../modules/categoryModule");

const createCategory = async (req, res) => {
  try {
    const {
      category_id,
      category_type,
      category_name,
      sub_categories,
      description,
      category_image,
      sort_order,
      status,
      created_by,
      updated_by,
      created_date,
      updated_date,
    } = req.body;

    if (!category_name || !category_type) {
      return res.status(400).json({
        success: false,
        message: "Category name and type are required",
      });
    }

    const nextCategoryId = await categoryModule.getNextCategoryId();

    const payload = {
      category_id: nextCategoryId,
      category_type,
      category_name,
      sub_categories: Array.isArray(sub_categories) ? sub_categories : [],
      description: description || "",
      category_image: category_image || null,
      sort_order: Number(sort_order || 1),
      status: status === false || status === "Inactive" ? "Inactive" : "Active",
      created_by: created_by || "Admin",
      updated_by: updated_by || created_by || "Admin",
      created_date: created_date || new Date().toISOString(),
      updated_date: updated_date || new Date().toISOString(),
    };

    const result = await categoryModule.createCategory(payload);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create category",
    });
  }
};

const getNextCategoryIdController = async (req, res) => {
  try {
    const nextCategoryId = await categoryModule.getNextCategoryId();
    res.status(200).json({
      success: true,
      data: nextCategoryId,
    });
  } catch (error) {
    console.error("Get next category id error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate category ID",
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryModule.getAllCategories();
    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve categories",
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await categoryModule.getCategoryById(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: category,
    });
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to load category",
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const updateData = req.body;

    const result = await categoryModule.updateCategory(categoryId, updateData);

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update category",
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const result = await categoryModule.deleteCategory(categoryId);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete category",
    });
  }
};

module.exports = {
  createCategory,
  getNextCategoryIdController,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
