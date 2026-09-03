const express = require("express");
const orderController = require("../controllers/orderController");

const router = express.Router();
router.get("/", orderController.getOrders);
router.post("/", orderController.createOrder);

router.post("/", orderController.createOrder);
router.get("/", orderController.getAllOrders);
router.get("/user/:userId", orderController.getOrdersByUser);
router.get("/:orderId", orderController.getOrderById);
router.patch("/:orderId/status", orderController.updateOrderStatus);
router.delete("/:orderId", orderController.deleteOrder);

module.exports = router;
