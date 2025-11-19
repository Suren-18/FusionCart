const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Public routes - UPDATED to match your controller
router.get('/', productController.getAllProducts);  // ✅ Matches
router.get('/categories', productController.getCategories);  // ✅ Matches
router.get('/brands', productController.getBrands);  // ✅ Matches
router.get('/search', productController.searchProducts);  // ✅ Changed from /suggestions
router.get('/:id', productController.getProductById);  // ✅ Matches
router.get('/:id/price-history', productController.getPriceHistory);  // ✅ Matches

module.exports = router;