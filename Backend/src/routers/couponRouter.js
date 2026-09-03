const express = require("express");
const couponController = require("../controllers/couponController");

const router = express.Router();

router.get("/", couponController.getAllCoupons);
router.post("/", couponController.createCoupon);
router.put("/:id", couponController.updateCoupon);
router.delete("/:id", couponController.deleteCoupon);

module.exports = router;
