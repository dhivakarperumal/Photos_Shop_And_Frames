const express = require("express");
const router = express.Router();

router.get("/public/all", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Services retrieved successfully",
    data: [],
    count: 0,
  });
});

module.exports = router;
