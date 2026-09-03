const couponModule = require("../modules/couponModule");

const getAllCoupons = async (req, res) => {
  try {
    const coupons = await couponModule.getAllCoupons();
    res.status(200).json({
      success: true,
      coupons,
      count: coupons.length,
    });
  } catch (error) {
    console.error("Get coupons error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve coupons",
    });
  }
};

const createCoupon = async (req, res) => {
  try {
    const coupon = await couponModule.createCoupon({
      ...req.body,
      created_by: req.body.created_by || req.user?.user_id || null,
      updated_by: req.body.updated_by || req.user?.user_id || req.body.created_by || null,
    });
    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: coupon,
    });
  } catch (error) {
    console.error("Create coupon error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create coupon",
    });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await couponModule.updateCoupon(id, {
      ...req.body,
      updated_by: req.body.updated_by || req.user?.user_id || null,
    });
    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Update coupon error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update coupon",
    });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await couponModule.deleteCoupon(id);
    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Delete coupon error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete coupon",
    });
  }
};

module.exports = {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
