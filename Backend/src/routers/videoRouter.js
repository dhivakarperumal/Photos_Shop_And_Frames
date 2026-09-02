const express = require("express");
const videoController = require("../controllers/videoController");

const router = express.Router();

router.get("/", videoController.getAllVideos);
router.post("/", videoController.createVideo);
router.put("/:id", videoController.updateVideo);
router.delete("/:id", videoController.deleteVideo);

module.exports = router;
