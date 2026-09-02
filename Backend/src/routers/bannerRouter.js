const express = require("express");
const bannerController = require("../controllers/bannerController");

const router = express.Router();

router.get("/", bannerController.getAllBanners);
router.post("/", bannerController.createBanner);
router.put("/:id", bannerController.updateBanner);
router.delete("/:id", bannerController.deleteBanner);

module.exports = router;
