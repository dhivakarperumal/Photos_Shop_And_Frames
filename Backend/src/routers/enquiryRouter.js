const express = require("express");
const enquiryController = require("../controllers/enquiryController");

const router = express.Router();

router.get("/", enquiryController.getAllEnquiries);
router.post("/", enquiryController.createEnquiry);
router.put("/:enquiryId", enquiryController.updateEnquiry);
router.delete("/:enquiryId", enquiryController.deleteEnquiry);

module.exports = router;
