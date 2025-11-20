// backend/utils/seedSingleProductPrice.js
// Quick script to add price history to ONE product
// Run with: node backend/utils/seedSingleProductPrice.js <productId>

require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const Product = require('../models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

async function seedSingleProduct(productId) {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let product;
    
    if (productId) {
      product = await Product.findById(productId);
      if (!product) {
        console.log(`❌ Product with ID ${productId} not found`);
        process.exit(1);
      }
    } else {
      // Get the first product
      product = await Product.findOne();
      if (!product) {
        console.log('❌ No products found in database');
        process.exit(1);
      }
    }

    console.log(`\n📦 Selected Product:`);
    console.log(`   ID: ${product._id}`);
    console.log(`   Name: ${product.ProductName}`);
    console.log(`   Current Price: $${product.price}`);

    // Generate 90 days of volatile price history
    const priceHistory = [];
    const now = new Date();
    const basePrice = product.price;
    const days = 90;

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Create interesting price movements
      const dayFactor = i / days;
      const volatility = (Math.random() - 0.5) * 0.25; // ±12.5%
      const trend = Math.sin(dayFactor * Math.PI * 3) * 0.15; // Wave pattern
      const spike = Math.random() > 0.95 ? (Math.random() - 0.5) * 0.3 : 0; // Occasional spikes
      
      const priceMultiplier = 1 + volatility + trend + spike;
      let price = basePrice * priceMultiplier;
      
      // Ensure price doesn't go too low or too high
      price = Math.max(price, basePrice * 0.6);
      price = Math.min(price, basePrice * 1.4);
      price = Math.round(price * 100) / 100;
      
      priceHistory.push({
        price: price,
        date: date
      });
    }

    // Update product
    product.priceHistory = priceHistory;
    product.price = priceHistory[priceHistory.length - 1].price;
    await product.save();

    const prices = priceHistory.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    console.log(`\n✅ Price history seeded successfully!`);
    console.log(`   📊 Statistics:`);
    console.log(`   - Total data points: ${priceHistory.length}`);
    console.log(`   - Date range: ${priceHistory[0].date.toLocaleDateString()} to ${priceHistory[priceHistory.length - 1].date.toLocaleDateString()}`);
    console.log(`   - Lowest price: $${minPrice.toFixed(2)}`);
    console.log(`   - Highest price: $${maxPrice.toFixed(2)}`);
    console.log(`   - Average price: $${avgPrice.toFixed(2)}`);
    console.log(`   - Current price: $${product.price.toFixed(2)}`);
    console.log(`\n🔗 View at: http://localhost:3000/products/${product._id}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Get product ID from command line argument
const productId = process.argv[2];

if (!productId) {
  console.log('ℹ️  No product ID provided. Will use the first product found.');
}

seedSingleProduct(productId);