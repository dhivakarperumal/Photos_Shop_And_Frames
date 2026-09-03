const galleryModule = require("../modules/galleryModule");

const getNextGalleryId = async (req, res) => {
  try {
    const nextGalleryId = await galleryModule.getNextGalleryId();
    return res.status(200).json({ success: true, data: nextGalleryId });
  } catch (error) {
    console.error("Get next gallery id error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate gallery ID",
    });
  }
};

const createAlbum = async (req, res) => {
  try {
    const {
      title,
      category,
      status,
      sort_order,
      short_description,
      description,
      cover_image,
      meta_title,
      meta_description,
      photos
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const albumData = {
      title,
      category,
      status,
      sort_order,
      short_description,
      description,
      cover_image,
      meta_title,
      meta_description
    };

    const result = await galleryModule.createAlbum(albumData, photos);

    res.status(201).json({
      success: true,
      message: "Album created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Create album error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create album",
    });
  }
};

const getAllAlbums = async (req, res) => {
  try {
    const albums = await galleryModule.getAllAlbums();
    res.status(200).json({
      success: true,
      data: albums,
    });
  } catch (error) {
    console.error("Get albums error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get albums",
    });
  }
};

const getAlbumById = async (req, res) => {
  try {
    const album = await galleryModule.getAlbumById(req.params.albumId);
    if (!album) return res.status(404).json({ success: false, message: "Gallery album not found" });
    return res.status(200).json({ success: true, data: album });
  } catch (error) {
    console.error("Get gallery album error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to get gallery album" });
  }
};

const updateAlbum = async (req, res) => {
  try {
    const album = await galleryModule.updateAlbum(req.params.albumId, req.body, req.body.photos);
    if (!album) return res.status(404).json({ success: false, message: "Gallery album not found" });
    return res.status(200).json({ success: true, message: "Gallery album updated successfully", data: album });
  } catch (error) {
    console.error("Update gallery album error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to update gallery album" });
  }
};

const deleteAlbum = async (req, res) => {
  try {
    const deleted = await galleryModule.deleteAlbum(req.params.albumId);
    if (!deleted) return res.status(404).json({ success: false, message: "Gallery album not found" });
    return res.status(200).json({ success: true, message: "Gallery album deleted successfully" });
  } catch (error) {
    console.error("Delete gallery album error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to delete gallery album" });
  }
};

module.exports = {
  getNextGalleryId,
  createAlbum,
  getAllAlbums,
  getAlbumById,
  updateAlbum,
  deleteAlbum,
};
