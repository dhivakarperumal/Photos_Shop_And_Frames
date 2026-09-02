const productModule = require("../modules/productModule");

const getNextProductIdController = async (req, res) => {
  try {
    const nextProductId = await productModule.getNextProductId();
    res.status(200).json({
      success: true,
      data: nextProductId,
    });
  } catch (error) {
    console.error("Get next product id error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate product ID",
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      uuid,
      product_id,
      product_name,
      category,
      material_type,
      color,
      description,
      size_variants,
      orientation,
      frame_id,
      frame_data,
      slot_photos,
      product_images,
      status,
      created_by,
      updated_by,
    } = req.body;

    if (!product_name || !product_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    const finalProductId = product_id || (await productModule.getNextProductId());

    const payload = {
      uuid: uuid || `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
      product_id: finalProductId,
      product_name: product_name.trim(),
      category: category.trim(),
      material_type: material_type || null,
      color: color || null,
      description: description || "",
      size_variants: Array.isArray(size_variants) ? size_variants : [],
      orientation: orientation || "Portrait",
      frame_id: frame_id || null,
      frame_data: frame_data || null,
      slot_photos: slot_photos || {},
      product_images: Array.isArray(product_images) ? product_images : [],
      status: status || "Active",
      created_by: created_by || null,
      updated_by: updated_by || created_by || null,
    };

    const result = await productModule.createProduct(payload);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create product",
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const { category, orientation, status, search } = req.query;
    const products = await productModule.getAllProducts({
      category,
      orientation,
      status,
      search,
    });

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve products",
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModule.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve product",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productModule.updateProduct(id, req.body);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productModule.deleteProduct(id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete product",
    });
  }
};

module.exports = {
  getNextProductIdController,
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
