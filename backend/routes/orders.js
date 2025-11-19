const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

// Protected routes (user)
router.post('/', auth, orderController.createOrder);
router.get('/', auth, orderController.getUserOrders);
router.get('/:orderId', auth, orderController.getOrderById);

// Admin routes
router.get('/all', auth, checkRole(['admin']), orderController.getAllOrders);
router.put('/:orderId/status', auth, checkRole(['admin']), orderController.updateOrderStatus);
router.get('/stats', auth, checkRole(['admin']), orderController.getOrderStats);

module.exports = router;