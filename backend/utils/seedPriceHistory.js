// backend/utils/seedPriceHistory.js
// Run this file with: node backend/utils/seedPriceHistory.js

require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const Product = require('../models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

// Generate specific trend patterns
function generateTrendingPriceHistory(basePrice, days = 365, trend = 'volatile') {
  const history = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    let price;
    
    switch(trend) {
      case 'increasing':
        // Gradually increasing price
        price = basePrice * (1 + (days - i) / days * 0.3);
        break;
      
      case 'decreasing':
        // Gradually decreasing price (sale)
        price = basePrice * (1 - (days - i) / days * 0.4);
        break;
      
      case 'volatile':
        // High volatility with random spikes
        const spike = Math.random() > 0.9 ? (Math.random() - 0.5) * 0.4 : 0;
        const noise = (Math.random() - 0.5) * 0.2;
        price = basePrice * (1 + spike + noise);
        break;
      
      case 'stable':
        // Mostly stable with minor fluctuations
        price = basePrice * (1 + (Math.random() - 0.5) * 0.05);
        break;
      
      default:
        price = basePrice;
    }
    
    history.push({
      price: Math.round(Math.max(price, basePrice * 0.3) * 100) / 100,
      date: date
    });
  }
  
  return history;
}

async function seedPriceHistory() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get products - DON'T use lean() so we can access the full document
    const products = await Product.find().limit(5);
    
    if (products.length === 0) {
      console.log('❌ No products found in database');
      console.log('💡 Please seed products first before running this script');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log(`📦 Found ${products.length} products. Seeding price history...\n`);

    // Seed different patterns for different products
    const patterns = ['volatile', 'increasing', 'decreasing', 'stable'];
    const updatedProducts = [];
    
    for (let i = 0; i < Math.min(products.length, 4); i++) {
      const product = products[i];
      const pattern = patterns[i];
      
      console.log(`📈 Seeding ${pattern} price history for: ${product.ProductName}`);
      console.log(`   Current Price: $${product.price}`);
      
      // Generate 1 year of price history
      const priceHistory = generateTrendingPriceHistory(product.price, 365, pattern);
      
      // Calculate new current price (last price in history)
      const newPrice = priceHistory[priceHistory.length - 1].price;
      
      // Update the product
      product.priceHistory = priceHistory;
      product.price = newPrice;
      await product.save();
      
      const prices = priceHistory.map(p => p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      console.log(`   ✓ Added ${priceHistory.length} price points`);
      console.log(`   Latest Price: $${newPrice.toFixed(2)}`);
      console.log(`   Price Range: $${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}\n`);
      
      updatedProducts.push({
        id: product._id,
        name: product.ProductName,
        pattern: pattern
      });
    }

    console.log('✅ Price history seeded successfully!\n');
    console.log('📋 Product IDs with price history:');
    updatedProducts.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.id} - ${p.name} (${p.pattern})`);
      console.log(`      View at: http://localhost:3000/products/${p.id}`);
    });
    
    console.log('\n💡 The URLs above are for your frontend. Make sure your React app is running on port 3000.');

  } catch (error) {
    console.error('❌ Error seeding price history:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the seed function
seedPriceHistory();