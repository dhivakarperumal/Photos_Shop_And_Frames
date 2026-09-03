const customizationModule = require("../modules/customizationModule");
const { v4: uuidv4 } = require("uuid");

const createCustomization = async (req, res) => {
  try {
    const {
      customization_id,
      user_id,
      product_id,
      slot_photos,
      preview_image,
    } = req.body;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required for customization",
      });
    }

    const finalCustomizationId =
      customization_id || `CUST-${Date.now()}-${uuidv4().substring(0, 8)}`;

    const result = await customizationModule.createCustomization({
      customization_id: finalCustomizationId,
      user_id: user_id || null,
      product_id,
      slot_photos: slot_photos || {},
      preview_image: preview_image || null,
      created_by: user_id || req.user?.user_id || req.user?.id || null,
      updated_by: user_id || req.user?.user_id || req.user?.id || null,
    });

    res.status(201).json({
      success: true,
      message: "Customized photos saved successfully in separate table",
      data: result,
    });
  } catch (error) {
    console.error("Create customization error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to save photo customization",
    });
  }
};

const getCustomizationById = async (req, res) => {
  try {
    const { id } = req.params;
    const customization = await customizationModule.getCustomizationById(id);

    if (!customization) {
      return res.status(404).json({
        success: false,
        message: "Customization not found",
      });
    }

    res.status(200).json({
      success: true,
      data: customization,
    });
  } catch (error) {
    console.error("Get customization error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get customization",
    });
  }
};

module.exports = {
  createCustomization,
  getCustomizationById,
};
