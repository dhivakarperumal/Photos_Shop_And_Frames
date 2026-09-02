const videoModule = require("../modules/videoModule");

const getAllVideos = async (req, res) => {
  try {
    const videos = await videoModule.getAllVideos();
    res.status(200).json(videos);
  } catch (error) {
    console.error("Get videos error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to load videos",
    });
  }
};

const createVideo = async (req, res) => {
  try {
    const { title, videoId, thumbnail, type, active } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Video title is required",
      });
    }

    if (!videoId || !videoId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Video source is required",
      });
    }

    const saved = await videoModule.createVideo({
      title,
      videoId,
      thumbnail,
      type,
      active,
    });

    res.status(201).json({
      success: true,
      message: "Video created successfully",
      data: saved,
    });
  } catch (error) {
    console.error("Create video error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create video",
    });
  }
};

const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await videoModule.updateVideo(id, req.body);

    res.status(200).json({
      success: true,
      message: "Video updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update video error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update video",
    });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await videoModule.deleteVideo(id);

    res.status(200).json({
      success: true,
      message: "Video deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Delete video error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete video",
    });
  }
};

module.exports = {
  getAllVideos,
  createVideo,
  updateVideo,
  deleteVideo,
};
