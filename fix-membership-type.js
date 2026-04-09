require('dotenv').config({ path: '.env.render' });
const { pool } = require('./src/config/database-tidb-render');

async function fix() {
  console.log('Using existing pool connection...');
  
  try {
    const [cols] = await pool.query('DESCRIBE members');
    console.log('Current columns:', cols.map(c => `${c.Field}: ${c.Type}`));
    
    await pool.query('ALTER TABLE members MODIFY COLUMN membership_type VARCHAR(100)');
    console.log('✅ Fixed membership_type column');
    
    await pool.query('ALTER TABLE members MODIFY COLUMN membership_status VARCHAR(50)');
    console.log('✅ Fixed membership_status column');
    
    console.log('✅ All columns fixed successfully!');
  } catch (error) {
    console.error('❌ Error fixing columns:', error.message);
  }
}

fix().catch(console.error);
