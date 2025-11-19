const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log('Testing MongoDB connection...\n');
    console.log('Connection string:', process.env.MONGODB_URI || 'mongodb://localhost:27017/amazonDB');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/amazonDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✓ MongoDB connected successfully!\n');
    
    // List all databases
    const admin = mongoose.connection.db.admin();
    const { databases } = await admin.listDatabases();
    
    console.log('Available databases:');
    databases.forEach(db => {
      console.log(`  - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // List collections in current database
    console.log('\nCollections in amazonDB:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('  (No collections yet)');
    } else {
      for (const col of collections) {
        const count = await mongoose.connection.db.collection(col.name).countDocuments();
        console.log(`  - ${col.name}: ${count} documents`);
      }
    }
    
    await mongoose.connection.close();
    console.log('\n✓ Test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Connection failed!');
    console.error('Error:', error.message);
    console.error('\nPossible issues:');
    console.error('1. MongoDB is not running');
    console.error('2. Wrong connection string in .env file');
    console.error('3. Database access permissions');
    process.exit(1);
  }
};

testConnection();