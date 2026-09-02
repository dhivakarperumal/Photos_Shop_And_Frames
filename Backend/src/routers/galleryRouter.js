const express = require("express");
const galleryController = require("../controllers/galleryController");

const router = express.Router();

router.post("/", galleryController.createAlbum);
router.get("/", galleryController.getAllAlbums);

module.exports = router;
