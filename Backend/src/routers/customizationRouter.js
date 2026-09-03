const express = require("express");
const customizationController = require("../controllers/customizationController");

const router = express.Router();

router.post("/", customizationController.createCustomization);
router.get("/:id", customizationController.getCustomizationById);

module.exports = router;
