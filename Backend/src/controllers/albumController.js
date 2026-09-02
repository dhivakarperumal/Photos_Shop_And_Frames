const albumModule = require("../modules/albumModule");

const createAlbum = async (req, res) => {
  try {
    const payload = req.body;

    if (!payload.product_name || !payload.product_code || !payload.category) {
      return res.status(400).json({
        success: false,
        message: "Product name, product code and category are required",
      });
    }

    const productId = payload.product_id || payload.productId || (await albumModule.getNextAlbumId());

    const albumPayload = {
      ...payload,
      product_id: productId,
      product_name: payload.product_name || payload.productName,
      product_code: payload.product_code || payload.productCode,
      category: payload.category || "Albums",
      sub_category: payload.sub_category || payload.subCategory || "Wedding Album",
      brand: payload.brand || "Q Frames",
      status: payload.status || "Active",
      stock_status: payload.stock_status || payload.stockStatus || "In Stock",
      created_by: payload.created_by || "Admin",
      updated_by: payload.updated_by || "Admin",
      created_at: payload.created_at || new Date().toISOString(),
      updated_at: payload.updated_at || new Date().toISOString(),
    };

    const result = await albumModule.createAlbum(albumPayload);

    return res.status(201).json({
      success: true,
      message: "Album created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Create album error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create album",
    });
  }
};

const getAllAlbums = async (req, res) => {
  try {
    const albums = await albumModule.getAllAlbums();
    return res.status(200).json({
      success: true,
      message: "Albums retrieved successfully",
      data: albums,
      count: albums.length,
    });
  } catch (error) {
    console.error("Get albums error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve albums",
    });
  }
};

const getAlbumById = async (req, res) => {
  try {
    const { albumId } = req.params;
    const album = await albumModule.getAlbumById(albumId);

    if (!album) {
      return res.status(404).json({
        success: false,
        message: "Album not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Album retrieved successfully",
      data: album,
    });
  } catch (error) {
    console.error("Get album by id error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get album",
    });
  }
};

const updateAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;
    const updateData = req.body;

    const result = await albumModule.updateAlbum(albumId, {
      ...updateData,
      updated_by: updateData.updated_by || "Admin",
      updated_at: updateData.updated_at || new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: "Album updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Update album error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update album",
    });
  }
};

const deleteAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;
    const result = await albumModule.deleteAlbum(albumId);

    return res.status(200).json({
      success: true,
      message: "Album deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Delete album error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete album",
    });
  }
};

const getNextAlbumIdController = async (req, res) => {
  try {
    const nextId = await albumModule.getNextAlbumId();
    return res.status(200).json({
      success: true,
      data: nextId,
    });
  } catch (error) {
    console.error("Next album ID error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate album ID",
    });
  }
};

module.exports = {
  createAlbum,
  getAllAlbums,
  getAlbumById,
  updateAlbum,
  deleteAlbum,
  getNextAlbumIdController,
};
