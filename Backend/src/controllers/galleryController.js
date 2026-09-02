const galleryModule = require("../modules/galleryModule");

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

module.exports = {
  createAlbum,
  getAllAlbums,
};
