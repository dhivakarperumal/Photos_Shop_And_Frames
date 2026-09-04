const express = require("express");
const enquiryController = require("../controllers/enquiryController");

const router = express.Router();

router.get("/", enquiryController.getAllEnquiries);
router.post("/", enquiryController.createEnquiry);

module.exports = router;
