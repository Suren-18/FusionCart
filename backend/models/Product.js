const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sample_id: String,
  ProductName: {
    type: String,
    required: true
  },
  ProductDescription: {
    type: String,
    required: true
  },
  image_link: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: String,
  brand: String,
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  priceHistory: [{
    price: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  stock: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);