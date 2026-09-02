const express = require("express");
const albumController = require("../controllers/albumController");

const router = express.Router();

router.get("/next-id", albumController.getNextAlbumIdController);
router.get("/", albumController.getAllAlbums);
router.get("/:albumId", albumController.getAlbumById);
router.post("/", albumController.createAlbum);
router.put("/:albumId", albumController.updateAlbum);
router.delete("/:albumId", albumController.deleteAlbum);

module.exports = router;
