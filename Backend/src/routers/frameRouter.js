const express = require("express");
const frameController = require("../controllers/frameController");

const router = express.Router();

/**
 * Frame Template Routes
 */
router.post("/", frameController.createFrame);
router.get("/", frameController.getAllFrames);
router.get("/:id", frameController.getFrameById);
router.put("/:id", frameController.updateFrame);
router.delete("/:id", frameController.deleteFrame);

module.exports = router;
