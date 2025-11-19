const Product = require('../models/Product');
const Review = require('../models/Review');
const Order = require('../models/Order');
const { analyzeSentiment } = require('../utils/sentiment');

// Add review
exports.addReview = async (req, res) => {
  try {
    const { productId, rating, text } = req.body;
    const userId = req.user.userId;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has purchased the product
    const hasPurchased = await Order.findOne({
      userId,
      'products.productId': productId,
      status: 'completed'
    });

    // Analyze sentiment
    const sentimentLabel = analyzeSentiment(text);

    // Create review
    const review = new Review({
      productId,
      userId,
      rating,
      text,
      verifiedPurchase: !!hasPurchased,
      sentimentLabel
    });

    await review.save();

    // Add review to product and update ratings
    product.reviews.push(review._id);
    
    const allReviews = await Review.find({ productId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    product.averageRating = totalRating / allReviews.length;
    product.totalReviews = allReviews.length;

    await product.save();

    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'username');

    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption.createdAt = -1;
        break;
      case 'oldest':
        sortOption.createdAt = 1;
        break;
      case 'highest':
        sortOption.rating = -1;
        break;
      case 'lowest':
        sortOption.rating = 1;
        break;
      case 'helpful':
        sortOption.helpfulCount = -1;
        break;
      default:
        sortOption.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ productId })
      .populate('userId', 'username')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ productId });

    res.json({
      reviews,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalReviews: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark review as helpful
exports.markHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user already marked as helpful
    if (review.helpfulBy.includes(userId)) {
      return res.status(400).json({ message: 'Already marked as helpful' });
    }

    review.helpfulCount += 1;
    review.helpfulBy.push(userId);
    await review.save();

    res.json({ helpfulCount: review.helpfulCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get review sentiment summary for a product
exports.getSentimentSummary = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ productId });

    const sentimentCounts = {
      positive: 0,
      neutral: 0,
      negative: 0
    };

    reviews.forEach(review => {
      sentimentCounts[review.sentimentLabel]++;
    });

    const total = reviews.length;

    res.json({
      total,
      positive: total > 0 ? Math.round((sentimentCounts.positive / total) * 100) : 0,
      neutral: total > 0 ? Math.round((sentimentCounts.neutral / total) * 100) : 0,
      negative: total > 0 ? Math.round((sentimentCounts.negative / total) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update review (user can edit their own review)
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, text } = req.body;
    const userId = req.user.userId;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    review.rating = rating;
    review.text = text;
    review.sentimentLabel = analyzeSentiment(text);
    await review.save();

    // Update product rating
    const product = await Product.findById(review.productId);
    const allReviews = await Review.find({ productId: review.productId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    product.averageRating = totalRating / allReviews.length;
    await product.save();

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Only review owner or admin can delete
    if (review.userId.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const productId = review.productId;
    await Review.findByIdAndDelete(reviewId);

    // Update product rating
    const product = await Product.findById(productId);
    product.reviews = product.reviews.filter(r => r.toString() !== reviewId);
    
    const allReviews = await Review.find({ productId });
    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      product.averageRating = totalRating / allReviews.length;
    } else {
      product.averageRating = 0;
    }
    product.totalReviews = allReviews.length;
    
    await product.save();

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};