const { initializeDatabase, testConnection } = require('./config/database-simple');

async function init() {
  console.log('Initializing database...');
  
  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    console.error('Failed to connect to database. Using in-memory fallback.');
  }
  
  // Initialize database tables
  await initializeDatabase();
  console.log('Database initialization completed!');
  process.exit(0);
}

init().catch(console.error);
