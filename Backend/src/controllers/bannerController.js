const bannerModule = require("../modules/bannerModule");

const getAllBanners = async (req, res) => {
  try {
    const banners = await bannerModule.getAllBanners();
    res.status(200).json(banners);
  } catch (error) {
    console.error("Get banners error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to load banners",
    });
  }
};

const createBanner = async (req, res) => {
  try {
    const { title, subtitle, description, image, mobile_image, link, type, active } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Banner title is required",
      });
    }

    const banner = await bannerModule.createBanner({
      title,
      subtitle,
      description,
      image,
      mobile_image,
      link,
      type,
      active,
    });

    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner,
    });
  } catch (error) {
    console.error("Create banner error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create banner",
    });
  }
};

const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await bannerModule.updateBanner(id, req.body);

    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: banner,
    });
  } catch (error) {
    console.error("Update banner error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update banner",
    });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await bannerModule.deleteBanner(id);

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Delete banner error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete banner",
    });
  }
};

module.exports = {
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
