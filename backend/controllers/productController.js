const Product = require('../models/Product');
const Review = require('../models/Review');
const { getReviewSentimentSummary } = require('../utils/sentiment');

exports.getAllProducts = async (req, res) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      search,
      sort,
      page = 1,
      limit = 20
    } = req.query;

    // Build filter object
    const filter = {};

    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    if (minRating) filter.rating = { $gte: parseFloat(minRating) };
    if (inStock === 'true') filter.stock = { $gt: 0 };
    if (search) filter.$text = { $search: search };

    // Sorting
    let sortOption = {};
    switch (sort) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'rating':
        sortOption = { rating: -1, numReviews: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'popular':
        sortOption = { numReviews: -1, rating: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Execute query
    const products = await Product.find(filter)
      .sort(sortOption)
      .limit(limitNum)
      .skip(skip)
      .lean();

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch products', 
      error: error.message 
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    // Fetch reviews
    const reviews = await Review.find({ productId: product._id })
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Get sentiment summary
    const sentimentSummary = getReviewSentimentSummary(reviews);

    // Fetch related products
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    })
    .limit(6)
    .lean();

    res.json({
      success: true,
      product,
      reviews,
      sentimentSummary,
      relatedProducts
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch product', 
      error: error.message 
    });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json({
      success: true,
      categories: categories.sort()
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch categories', 
      error: error.message 
    });
  }
};

exports.getBrands = async (req, res) => {
  try {
    const brands = await Product.distinct('brand');
    res.json({
      success: true,
      brands: brands.sort()
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch brands', 
      error: error.message 
    });
  }
};

exports.getPriceHistory = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .select('priceHistory price name')
      .lean();
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    let history = product.priceHistory || [];
    
    // If no price history, create one with current price
    if (history.length === 0) {
      history = [{
        price: product.price,
        timestamp: new Date()
      }];
    }

    res.json({
      success: true,
      productName: product.name,
      currentPrice: product.price,
      history
    });
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch price history', 
      error: error.message 
    });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.json({
        success: true,
        products: []
      });
    }

    const products = await Product.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .limit(parseInt(limit))
    .lean();

    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ 
      success: false,
      message: 'Search failed', 
      error: error.message 
    });
  }
};