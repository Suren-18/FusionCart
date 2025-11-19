const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const Review = require('../models/Review');

// Add new product
exports.addProduct = async (req, res) => {
  try {
    const productData = req.body;

    const product = new Product({
      ...productData,
      priceHistory: [{
        price: productData.price,
        date: new Date()
      }]
    });

    await product.save();

    res.status(201).json({
      message: 'Product added successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // If price is updated, add to price history
    if (updateData.price && updateData.price !== product.price) {
      product.priceHistory.push({
        price: updateData.price,
        date: new Date()
      });
    }

    Object.assign(product, updateData);
    await product.save();

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete associated reviews
    await Review.deleteMany({ productId: id });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Bulk delete products
exports.bulkDeleteProducts = async (req, res) => {
  try {
    const { productIds } = req.body;

    await Product.deleteMany({ _id: { $in: productIds } });
    await Review.deleteMany({ productId: { $in: productIds } });

    res.json({ 
      message: 'Products deleted successfully',
      count: productIds.length 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get analytics data
exports.getAnalytics = async (req, res) => {
  try {
    // Total products
    const totalProducts = await Product.countDocuments();

    // Total users
    const totalUsers = await User.countDocuments({ role: 'user' });

    // Total orders and revenue
    const orderStats = await Order.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Total reviews
    const totalReviews = await Review.countDocuments();

    // Top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.productId',
          totalSold: { $sum: '$products.quantity' },
          revenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    // Populate product details
    const topProductsWithDetails = await Product.populate(topProducts, {
      path: '_id',
      select: 'productName image_link price'
    });

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'username email');

    // Sales by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesByDate = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, status: 'completed' } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      summary: {
        totalProducts,
        totalUsers,
        totalOrders: orderStats[0]?.totalOrders || 0,
        totalRevenue: orderStats[0]?.totalRevenue || 0,
        totalReviews
      },
      topProducts: topProductsWithDetails,
      recentOrders,
      salesByDate
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Export analytics to CSV
exports.exportAnalytics = async (req, res) => {
  try {
    const { type } = req.query; // 'orders', 'products', 'users'

    let data = [];
    let headers = '';

    switch (type) {
      case 'orders':
        const orders = await Order.find()
          .populate('userId', 'username email')
          .sort({ createdAt: -1 });
        
        headers = 'Order ID,User,Email,Total Amount,Status,Delivery Status,Created At\n';
        data = orders.map(order => 
          `${order._id},${order.userId?.username || 'N/A'},${order.userId?.email || 'N/A'},${order.totalAmount},${order.status},${order.deliveryStatus},${order.createdAt}`
        );
        break;

      case 'products':
        const products = await Product.find();
        headers = 'Product ID,Name,Price,Category,Brand,Rating,Reviews,Stock\n';
        data = products.map(product =>
          `${product._id},"${product.ProductName}",${product.price},${product.category || 'N/A'},${product.brand || 'N/A'},${product.averageRating || 0},${product.totalReviews || 0},${product.stock || 0}`
        );
        break;

      case 'users':
        const users = await User.find({ role: 'user' }).select('-password');
        headers = 'User ID,Username,Email,Created At\n';
        data = users.map(user =>
          `${user._id},${user.username},${user.email},${user.createdAt}`
        );
        break;

      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }

    const csv = headers + data.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-export.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Moderate review (flag/unflag)
exports.moderateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { flagged } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.flagged = flagged;
    await review.save();

    res.json({
      message: `Review ${flagged ? 'flagged' : 'unflagged'} successfully`,
      review
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments();

    res.json({
      users,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalUsers: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};