// Mock database for testing when TiDB is not available
let mockData = {
  members: [],
  payments: [],
  attendance: [],
  announcements: []
};

const pool = {
  query: async (sql, params = []) => {
    console.log('Mock SQL Query:', sql);
    console.log('Mock Params:', params);
    
    // Simulate database operations
    if (sql.includes('INSERT INTO members')) {
      const member = {
        id: params[0],
        first_name: params[1],
        last_name: params[2],
        phone: params[3],
        email: params[4],
        date_of_birth: params[5],
        membership_type: params[6],
        membership_status: params[7],
        join_date: params[8],
        expiry_date: params[9],
        created_at: new Date().toISOString()
      };
      mockData.members.push(member);
      return [{ insertId: member.id }];
    }
    
    if (sql.includes('SELECT * FROM members')) {
      return [mockData.members];
    }
    
    if (sql.includes('INSERT INTO payments')) {
      const payment = {
        id: Date.now(),
        member_id: params[0],
        amount: params[1],
        payment_type: params[2],
        payment_method: params[3],
        payment_date: params[4],
        status: params[5],
        description: params[6],
        created_at: new Date().toISOString()
      };
      mockData.payments.push(payment);
      return [{ insertId: payment.id }];
    }
    
    if (sql.includes('SELECT * FROM payments')) {
      return [mockData.payments];
    }
    
    if (sql.includes('INSERT INTO attendance')) {
      const attendance = {
        id: Date.now(),
        member_id: params[0],
        check_in_time: new Date().toISOString(),
        created_at: params[1],
        notes: params[2]
      };
      mockData.attendance.push(attendance);
      return [{ insertId: attendance.id }];
    }
    
    if (sql.includes('SELECT * FROM attendance')) {
      return [mockData.attendance];
    }
    
    if (sql.includes('INSERT INTO announcements')) {
      const announcement = {
        id: Date.now(),
        title: params[0],
        content: params[1],
        type: params[2],
        status: params[3],
        author_id: params[4],
        publish_date: new Date().toISOString(),
        active: true
      };
      mockData.announcements.push(announcement);
      return [{ insertId: announcement.id }];
    }
    
    if (sql.includes('SELECT * FROM announcements')) {
      return [mockData.announcements];
    }
    
    // Default response
    return [];
  }
};

async function testConnection() {
  console.log('Mock database connection - always successful');
  return true;
}

async function initializeDatabase() {
  console.log('Mock database initialized');
  console.log('Mock data:', JSON.stringify(mockData, null, 2));
}

module.exports = {
  pool,
  testConnection,
  initializeDatabase,
  mockData
};
