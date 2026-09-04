const express = require("express");
const giftBoxController = require("../controllers/giftBoxController");

const router = express.Router();

router.get("/", giftBoxController.getAllGiftBoxes);
router.get("/:id", giftBoxController.getGiftBoxById);
router.post("/", giftBoxController.createGiftBox);
router.put("/:id", giftBoxController.updateGiftBox);
router.delete("/:id", giftBoxController.deleteGiftBox);

module.exports = router;
