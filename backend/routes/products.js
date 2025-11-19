const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/categories', productController.getCategories);
router.get('/brands', productController.getBrands);
router.get('/search', productController.searchProducts);
router.get('/suggestions', productController.getSearchSuggestions);  // NEW
router.get('/:id', productController.getProductById);
router.get('/:id/price-history', productController.getPriceHistory);

module.exports = router;