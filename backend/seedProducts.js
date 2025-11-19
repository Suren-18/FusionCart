const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

console.log('='.repeat(60));
console.log('PRODUCT SEEDING SCRIPT');
console.log('='.repeat(60));
console.log('\nStarting...\n');

// Check if .env file exists
const fs = require('fs');
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('⚠ WARNING: .env file not found!');
  console.log('Creating default .env file...\n');
  fs.writeFileSync(envPath, `PORT=5000
MONGODB_URI=mongodb://localhost:27017/amazonDB
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
SESSION_TIMEOUT=1800000
NODE_ENV=development`);
  console.log('✓ .env file created with default values\n');
  require('dotenv').config();
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/amazonDB';
console.log('MongoDB URI:', MONGODB_URI);
console.log('');

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  images: [String],
  category: String,
  price: Number,
  priceHistory: [{
    price: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  brand: String,
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  stock: Number,
  variants: [{
    name: String,
    value: String,
    price: Number
  }],
  sku: { type: String, unique: true },
  specifications: { type: Map, of: String },
  deliveryDays: { type: Number, default: 5 },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'products' });

productSchema.index({ name: 'text', description: 'text', brand: 'text' });

const sampleProducts = [
  {
    name: "Sony WH-1000XM5 Wireless Headphones",
    description: "Industry-leading noise canceling with Premium Sound Quality. Up to 30-hour battery life with quick charging.",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500"
    ],
    category: "Electronics",
    price: 29999,
    priceHistory: [{ price: 29999, timestamp: new Date() }],
    brand: "Sony",
    rating: 4.8,
    numReviews: 1247,
    stock: 45,
    sku: "SONY-WH1000XM5-BLK",
    specifications: new Map([
      ["Battery Life", "30 hours"],
      ["Noise Cancellation", "Yes"],
      ["Wireless", "Bluetooth 5.2"]
    ]),
    deliveryDays: 2
  },
  {
    name: "Apple MacBook Air M2",
    description: "13.6-inch Liquid Retina display, 8GB RAM, 256GB SSD. Apple M2 chip with 8-core CPU.",
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500"],
    category: "Computers",
    price: 114900,
    priceHistory: [{ price: 114900, timestamp: new Date() }],
    brand: "Apple",
    rating: 4.9,
    numReviews: 892,
    stock: 15,
    sku: "APPLE-MBA-M2-256",
    specifications: new Map([
      ["Processor", "Apple M2"],
      ["RAM", "8GB"],
      ["Storage", "256GB SSD"]
    ]),
    deliveryDays: 3
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "6.8-inch Dynamic AMOLED display, 12GB RAM, 256GB storage. 200MP camera.",
    images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500"],
    category: "Mobile Phones",
    price: 124999,
    priceHistory: [{ price: 124999, timestamp: new Date() }],
    brand: "Samsung",
    rating: 4.7,
    numReviews: 2156,
    stock: 60,
    sku: "SAMS-S24U-256-BLK",
    specifications: new Map([
      ["Display", "6.8-inch AMOLED"],
      ["RAM", "12GB"],
      ["Storage", "256GB"]
    ]),
    deliveryDays: 1
  },
  {
    name: "Nike Air Max 270",
    description: "The Nike Air Max 270 delivers visible cushioning under every step.",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"],
    category: "Footwear",
    price: 12995,
    priceHistory: [{ price: 12995, timestamp: new Date() }],
    brand: "Nike",
    rating: 4.6,
    numReviews: 534,
    stock: 120,
    sku: "NIKE-AM270-BLK-10",
    specifications: new Map([
      ["Material", "Mesh and Synthetic"],
      ["Sole", "Rubber"]
    ]),
    deliveryDays: 4
  },
  {
    name: "Canon EOS R6 Mark II",
    description: "24.2MP Full-Frame CMOS sensor with 40fps continuous shooting.",
    images: ["https://images.unsplash.com/photo-1606980543022-b7f2d46d2b2f?w=500"],
    category: "Cameras",
    price: 239995,
    priceHistory: [{ price: 239995, timestamp: new Date() }],
    brand: "Canon",
    rating: 4.9,
    numReviews: 178,
    stock: 8,
    sku: "CANON-R6M2-BODY",
    specifications: new Map([
      ["Sensor", "24.2MP Full-Frame"],
      ["Video", "6K RAW"]
    ]),
    deliveryDays: 5
  },
  {
    name: "Adidas Ultraboost 22",
    description: "Premium running shoes with responsive Boost cushioning.",
    images: ["https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500"],
    category: "Footwear",
    price: 16999,
    priceHistory: [{ price: 16999, timestamp: new Date() }],
    brand: "Adidas",
    rating: 4.7,
    numReviews: 423,
    stock: 85,
    sku: "ADIDAS-UB22-WHT-9",
    specifications: new Map([
      ["Material", "Primeknit"],
      ["Midsole", "Boost Technology"]
    ]),
    deliveryDays: 3
  },
  {
    name: "LG 55-inch 4K OLED TV",
    description: "Self-lit OLED pixels for perfect black and infinite contrast.",
    images: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500"],
    category: "Electronics",
    price: 139990,
    priceHistory: [{ price: 139990, timestamp: new Date() }],
    brand: "LG",
    rating: 4.8,
    numReviews: 672,
    stock: 22,
    sku: "LG-OLED55C3-55",
    specifications: new Map([
      ["Screen Size", "55 inches"],
      ["Resolution", "4K UHD"]
    ]),
    deliveryDays: 6
  },
  {
    name: "Bose QuietComfort Earbuds II",
    description: "Personalized noise cancellation and sound. All-day comfort.",
    images: ["https://images.unsplash.com/photo-1590658165737-15a047b7a4b2?w=500"],
    category: "Electronics",
    price: 26900,
    priceHistory: [{ price: 26900, timestamp: new Date() }],
    brand: "Bose",
    rating: 4.6,
    numReviews: 891,
    stock: 75,
    sku: "BOSE-QCE2-BLK",
    specifications: new Map([
      ["Battery Life", "6 hours"],
      ["Noise Cancellation", "Adaptive"]
    ]),
    deliveryDays: 2
  },
  {
    name: "The North Face Recon Backpack",
    description: "Durable laptop backpack with FlexVent suspension system.",
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500"],
    category: "Bags",
    price: 8999,
    priceHistory: [{ price: 8999, timestamp: new Date() }],
    brand: "The North Face",
    rating: 4.7,
    numReviews: 1023,
    stock: 95,
    sku: "TNF-RECON-BLK",
    specifications: new Map([
      ["Capacity", "30 Liters"],
      ["Material", "Recycled Polyester"]
    ]),
    deliveryDays: 3
  },
  {
    name: "Dyson V15 Detect Cordless Vacuum",
    description: "Laser reveals invisible dust. Up to 60 minutes run time.",
    images: ["https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500"],
    category: "Home Appliances",
    price: 64900,
    priceHistory: [{ price: 64900, timestamp: new Date() }],
    brand: "Dyson",
    rating: 4.8,
    numReviews: 456,
    stock: 18,
    sku: "DYSON-V15-DETECT",
    specifications: new Map([
      ["Run Time", "Up to 60 minutes"],
      ["Filtration", "Advanced HEPA"]
    ]),
    deliveryDays: 4
  },
  {
    name: "Levi's 501 Original Jeans",
    description: "The original straight fit jeans since 1873.",
    images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=500"],
    category: "Clothing",
    price: 3999,
    priceHistory: [{ price: 3999, timestamp: new Date() }],
    brand: "Levi's",
    rating: 4.5,
    numReviews: 2341,
    stock: 200,
    sku: "LEVIS-501-BLU-32",
    specifications: new Map([
      ["Material", "100% Cotton"],
      ["Fit", "Straight"]
    ]),
    deliveryDays: 3
  },
  {
    name: "KitchenAid Stand Mixer",
    description: "5-quart stainless steel bowl with 10-speed slide control.",
    images: ["https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=500"],
    category: "Home Appliances",
    price: 42900,
    priceHistory: [{ price: 42900, timestamp: new Date() }],
    brand: "KitchenAid",
    rating: 4.9,
    numReviews: 1876,
    stock: 35,
    sku: "KA-MIXER-5QT-RED",
    specifications: new Map([
      ["Capacity", "5 Quarts"],
      ["Speeds", "10"]
    ]),
    deliveryDays: 5
  },
  {
    name: "Fossil Gen 6 Smartwatch",
    description: "Wear OS smartwatch with heart rate tracking and GPS.",
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"],
    category: "Wearables",
    price: 21995,
    priceHistory: [{ price: 21995, timestamp: new Date() }],
    brand: "Fossil",
    rating: 4.4,
    numReviews: 567,
    stock: 55,
    sku: "FOSSIL-GEN6-BLK",
    specifications: new Map([
      ["Display", "1.28-inch AMOLED"],
      ["Battery", "24+ hours"]
    ]),
    deliveryDays: 3
  },
  {
    name: "Kindle Paperwhite 11th Gen",
    description: "6.8-inch glare-free display with adjustable warm light.",
    images: ["https://images.unsplash.com/photo-1592503254549-d83d24a4dfab?w=500"],
    category: "Electronics",
    price: 13999,
    priceHistory: [{ price: 13999, timestamp: new Date() }],
    brand: "Amazon",
    rating: 4.7,
    numReviews: 3421,
    stock: 140,
    sku: "AMZ-KPW-11-8GB",
    specifications: new Map([
      ["Display", "6.8-inch E-ink"],
      ["Storage", "8GB"]
    ]),
    deliveryDays: 2
  },
  {
    name: "Yeti Rambler 30oz Tumbler",
    description: "Double-wall vacuum insulation keeps drinks cold or hot.",
    images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500"],
    category: "Accessories",
    price: 3499,
    priceHistory: [{ price: 3499, timestamp: new Date() }],
    brand: "Yeti",
    rating: 4.8,
    numReviews: 4567,
    stock: 180,
    sku: "YETI-RAM-30-BLK",
    specifications: new Map([
      ["Capacity", "30oz"],
      ["Material", "Stainless Steel"]
    ]),
    deliveryDays: 2
  },
  {
    name: "Instant Pot Duo Plus 6Qt",
    description: "9-in-1 programmable pressure cooker.",
    images: ["https://images.unsplash.com/photo-1585515320310-259814833e62?w=500"],
    category: "Home Appliances",
    price: 9999,
    priceHistory: [{ price: 9999, timestamp: new Date() }],
    brand: "Instant Pot",
    rating: 4.7,
    numReviews: 8934,
    stock: 65,
    sku: "IP-DUO-6QT",
    specifications: new Map([
      ["Capacity", "6 Quarts"],
      ["Functions", "9-in-1"]
    ]),
    deliveryDays: 4
  },
  {
    name: "Logitech MX Master 3S",
    description: "Wireless performance mouse with ultra-fast scrolling.",
    images: ["https://images.unsplash.com/photo-1527814050087-3793815479db?w=500"],
    category: "Computers",
    price: 8995,
    priceHistory: [{ price: 8995, timestamp: new Date() }],
    brand: "Logitech",
    rating: 4.8,
    numReviews: 1234,
    stock: 90,
    sku: "LOGI-MXM3S-BLK",
    specifications: new Map([
      ["DPI", "8000"],
      ["Connectivity", "Bluetooth"]
    ]),
    deliveryDays: 2
  },
  {
    name: "Herman Miller Aeron Chair",
    description: "Ergonomic office chair with PostureFit SL support.",
    images: ["https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500"],
    category: "Furniture",
    price: 124900,
    priceHistory: [{ price: 124900, timestamp: new Date() }],
    brand: "Herman Miller",
    rating: 4.9,
    numReviews: 892,
    stock: 12,
    sku: "HM-AERON-B-BLK",
    specifications: new Map([
      ["Size", "B (Medium)"],
      ["Material", "Pellicle Mesh"]
    ]),
    deliveryDays: 7
  },
  {
    name: "Ray-Ban Wayfarer Sunglasses",
    description: "Classic acetate frame sunglasses with 100% UV protection.",
    images: ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500"],
    category: "Accessories",
    price: 12999,
    priceHistory: [{ price: 12999, timestamp: new Date() }],
    brand: "Ray-Ban",
    rating: 4.6,
    numReviews: 2345,
    stock: 110,
    sku: "RB-WAY-2140-BLK",
    specifications: new Map([
      ["Lens", "Polarized"],
      ["UV Protection", "100%"]
    ]),
    deliveryDays: 3
  },
  {
    name: "GoPro HERO12 Black",
    description: "5.3K60 video with HyperSmooth 6.0 stabilization.",
    images: ["https://images.unsplash.com/photo-1606941369073-1598524429293?w=500"],
    category: "Cameras",
    price: 44999,
    priceHistory: [{ price: 44999, timestamp: new Date() }],
    brand: "GoPro",
    rating: 4.7,
    numReviews: 678,
    stock: 42,
    sku: "GP-H12-BLK",
    specifications: new Map([
      ["Video", "5.3K60"],
      ["Photo", "27MP"]
    ]),
    deliveryDays: 3
  }
];

const seedDatabase = async () => {
  let connection;
  
  try {
    console.log('Step 1: Connecting to MongoDB...');
    connection = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✓ Connected to MongoDB successfully\n');

    const Product = mongoose.model('Product', productSchema);

    console.log('Step 2: Checking existing products...');
    const existingCount = await Product.countDocuments();
    console.log(`Found ${existingCount} existing products`);

    if (existingCount >= 20) {
      console.log('\n⚠ Database already has 20 or more products!');
      console.log('Skipping insertion to avoid duplicates.\n');
      console.log('To reset and re-seed:');
      console.log('1. Open MongoDB Compass or mongo shell');
      console.log('2. Delete the products collection');
      console.log('3. Run this script again\n');
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log('\nStep 3: Inserting sample products...');
    console.log('This may take a few seconds...\n');

    const inserted = await Product.insertMany(sampleProducts, { ordered: false });
    
    console.log('✓ Successfully inserted ' + inserted.length + ' products\n');
    console.log('='.repeat(60));
    console.log('SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));

    const total = await Product.countDocuments();
    console.log(`\nTotal products in database: ${total}`);
    
    const categories = await Product.distinct('category');
    console.log(`Categories: ${categories.join(', ')}`);
    
    const brands = await Product.distinct('brand');
    console.log(`Brands (${brands.length}): ${brands.slice(0, 5).join(', ')}...`);

    console.log('\n✓ You can now start your servers:');
    console.log('  Backend:  cd backend && npm start');
    console.log('  Frontend: cd frontend && npm start\n');

    await mongoose.connection.close();
    console.log('✓ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('ERROR OCCURRED!');
    console.error('='.repeat(60));
    console.error('\nError details:', error.message);
    
    if (error.code === 11000) {
      console.error('\n⚠ Duplicate key error!');
      console.error('Some products with the same SKU already exist.');
      console.error('Please clear the products collection and try again.');
    } else if (error.name === 'MongoServerError') {
      console.error('\n⚠ MongoDB server error!');
      console.error('Please check if MongoDB is running:');
      console.error('  Windows: net start MongoDB');
      console.error('  Mac/Linux: sudo systemctl start mongod');
    } else if (error.name === 'MongooseServerSelectionError') {
      console.error('\n⚠ Cannot connect to MongoDB!');
      console.error('Please ensure:');
      console.error('1. MongoDB is installed and running');
      console.error('2. Connection string is correct in .env file');
      console.error('3. No firewall is blocking the connection');
    }
    
    if (connection) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedDatabase();