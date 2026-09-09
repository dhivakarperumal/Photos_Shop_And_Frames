const express = require("express");
const orderController = require("../controllers/orderController");

const router = express.Router();

router.get("/", orderController.getAllOrders);
router.post("/payment/create", orderController.createPaymentOrder);
router.post("/payment/verify", orderController.verifyPayment);
router.post("/", orderController.createOrder);
router.get("/user/:userId", orderController.getOrdersByUser);
router.get("/:orderId", orderController.getOrderById);
router.patch("/:orderId/status", orderController.updateOrderStatus);
router.delete("/:orderId", orderController.deleteOrder);

module.exports = router;
