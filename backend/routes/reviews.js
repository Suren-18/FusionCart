const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

// Public routes
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/product/:productId/sentiment', reviewController.getSentimentSummary);

// Protected routes
router.post('/', auth, reviewController.addReview);
router.post('/:reviewId/helpful', auth, reviewController.markHelpful);
router.put('/:reviewId', auth, reviewController.updateReview);
router.delete('/:reviewId', auth, reviewController.deleteReview);

module.exports = router;