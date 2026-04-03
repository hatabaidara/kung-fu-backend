const { testConnection, initializeDatabase } = require('./src/config/database');

async function testDatabaseConnection() {
  console.log('🔍 Testing TiDB connection...');
  
  // Test connection
  const connected = await testConnection();
  
  if (connected) {
    console.log('✅ TiDB connection successful!');
    
    // Initialize database
    try {
      await initializeDatabase();
      console.log('✅ Database initialized successfully!');
    } catch (error) {
      console.error('❌ Database initialization failed:', error.message);
    }
  } else {
    console.log('❌ TiDB connection failed');
    console.log('💡 Please check your .env file with TiDB credentials');
  }
}

testDatabaseConnection();
