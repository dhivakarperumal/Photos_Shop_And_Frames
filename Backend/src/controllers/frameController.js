const frameModule = require("../modules/frameModule");

const createFrame = async (req, res) => {
  try {
    const {
      uuid,
      frame_name,
      orientation,
      frame_image,
      photo_slots,
      status,
      created_by,
      updated_by,
    } = req.body;

    const activeUserId = req.user?.userId || req.user?.id || req.user?.user_id || created_by || updated_by || null;

    if (!frame_name || !frame_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Frame name is required",
      });
    }

    if (!frame_image) {
      return res.status(400).json({
        success: false,
        message: "Frame image is required",
      });
    }

    const payload = {
      uuid: uuid || `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
      frame_name: frame_name.trim(),
      orientation: orientation || "Portrait",
      frame_image,
      photo_slots: Array.isArray(photo_slots) ? photo_slots : [],
      status: status || "Active",
      created_by: created_by || activeUserId || null,
      updated_by: updated_by || created_by || activeUserId || null,
    };

    const result = await frameModule.createFrame(payload);

    res.status(201).json({
      success: true,
      message: "Frame template created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Create frame error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create frame template",
    });
  }
};

const getAllFrames = async (req, res) => {
  try {
    const { orientation, status } = req.query;
    const frames = await frameModule.getAllFrames({ orientation, status });

    res.status(200).json({
      success: true,
      message: "Frames retrieved successfully",
      count: frames.length,
      data: frames,
    });
  } catch (error) {
    console.error("Get frames error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve frames",
    });
  }
};

const getFrameById = async (req, res) => {
  try {
    const { id } = req.params;
    const frame = await frameModule.getFrameById(id);

    if (!frame) {
      return res.status(404).json({
        success: false,
        message: "Frame not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Frame retrieved successfully",
      data: frame,
    });
  } catch (error) {
    console.error("Get frame error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve frame",
    });
  }
};

const updateFrame = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = {
      ...req.body,
      updated_by:
        req.body.updated_by ||
        req.body.created_by ||
        req.user?.userId ||
        req.user?.id ||
        req.user?.user_id ||
        null,
    };
    const result = await frameModule.updateFrame(id, payload);

    res.status(200).json({
      success: true,
      message: "Frame updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Update frame error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update frame",
    });
  }
};

const deleteFrame = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await frameModule.deleteFrame(id);

    res.status(200).json({
      success: true,
      message: "Frame deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Delete frame error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete frame",
    });
  }
};

module.exports = {
  createFrame,
  getAllFrames,
  getFrameById,
  updateFrame,
  deleteFrame,
};
