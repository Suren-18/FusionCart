const Order = require('../models/Order');
const Product = require('../models/Product');

// Create order
exports.createOrder = async (req, res) => {
  try {
    const { products } = req.body; // products: [{productId, quantity}]
    const userId = req.user.userId;

    // Validate products
    const productDetails = [];
    let totalAmount = 0;

    for (let item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ 
          message: `Product ${item.productId} not found` 
        });
      }

      productDetails.push({
        productId: product._id,
        productName: product.ProductName,
        quantity: item.quantity,
        price: product.price
      });

      totalAmount += product.price * item.quantity;
    }

    // Create order
    const order = new Order({
      userId,
      products: productDetails,
      totalAmount,
      status: 'completed', // Since we're not doing real payment
      deliveryStatus: 'processing'
    });

    await order.save();

    res.status(201).json({
      message: 'Purchase Success',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments({ userId });

    res.json({
      orders,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalOrders: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single order
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order or is admin
    if (order.userId.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryStatus } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.deliveryStatus = deliveryStatus;
    
    if (deliveryStatus === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = {};
    if (status) {
      query.deliveryStatus = status;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalOrders: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get order statistics (admin only)
exports.getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    
    const revenueData = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    const deliveryStats = await Order.aggregate([
      {
        $group: {
          _id: '$deliveryStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalOrders,
      completedOrders,
      totalRevenue,
      deliveryStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};