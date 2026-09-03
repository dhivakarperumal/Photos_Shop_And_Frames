const express = require("express");
const galleryController = require("../controllers/galleryController");

const router = express.Router();

router.get("/next-id", galleryController.getNextGalleryId);
router.post("/", galleryController.createAlbum);
router.get("/", galleryController.getAllAlbums);
router.get("/:albumId", galleryController.getAlbumById);
router.put("/:albumId", galleryController.updateAlbum);
router.delete("/:albumId", galleryController.deleteAlbum);

module.exports = router;
