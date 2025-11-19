const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

// All admin routes require authentication and admin role
router.use(auth);
router.use(checkRole(['admin']));

// Product management
router.post('/products', adminController.addProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);
router.post('/products/bulk-delete', adminController.bulkDeleteProducts);

// Analytics
router.get('/analytics', adminController.getAnalytics);
router.get('/analytics/export', adminController.exportAnalytics);

// Review moderation
router.put('/reviews/:reviewId/moderate', adminController.moderateReview);

// User management
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/role', adminController.updateUserRole);

module.exports = router;