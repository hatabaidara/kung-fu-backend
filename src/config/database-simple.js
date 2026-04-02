// Simple in-memory database for development
class InMemoryDatabase {
  constructor() {
    this.users = [];
    this.members = [
      {
        id: "M001",
        name: "Ahmed Diallo",
        phone: "77 123 45 67",
        email: "ahmed.diallo@email.com",
        discipline: "Boxe",
        age: 25,
        address: "Dakar, Plateau",
        license_number: "BOX2024001",
        license_status: "Actif",
        license_expiry: "2025-01-15",
        join_date: "2024-01-15",
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: "M002",
        name: "Fatou Sène",
        phone: "76 234 56 78",
        email: "fatou.sene@email.com",
        discipline: "Kung Fu",
        age: 22,
        address: "Dakar, Sacré-Coeur",
        license_number: "KF2024002",
        license_status: "Actif",
        license_expiry: "2025-02-20",
        join_date: "2024-02-20",
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    this.payments = [];
    this.attendance = [];
    this.announcements = [];
    this.nextId = 1;
  }

  async query(sql, params = []) {
    console.log(`[IN-MEMORY DB] ${sql}`, params);
    
    // Simple query simulation for basic operations
    if (sql.includes('SELECT') && sql.includes('members')) {
      if (sql.includes('LEFT JOIN')) {
        // Handle JOIN queries
        const results = this.members.map(member => ({
          ...member,
          member_name: member.name
        }));
        return [results];
      }
      return [this.members];
    }
    
    if (sql.includes('INSERT') && sql.includes('members')) {
      const newMember = {
        id: `M${this.nextId++}`,
        ...params[1],
        created_at: new Date(),
        updated_at: new Date()
      };
      this.members.push(newMember);
      return [{ insertId: newMember.id }];
    }
    
    if (sql.includes('UPDATE') && sql.includes('members')) {
      const memberId = params[params.length - 1];
      const memberIndex = this.members.findIndex(m => m.id === memberId);
      if (memberIndex !== -1) {
        this.members[memberIndex] = {
          ...this.members[memberIndex],
          ...params.slice(0, -1),
          updated_at: new Date()
        };
        return [{ affectedRows: 1 }];
      }
      return [{ affectedRows: 0 }];
    }
    
    if (sql.includes('DELETE') && sql.includes('members')) {
      const memberId = params[0];
      const initialLength = this.members.length;
      this.members = this.members.filter(m => m.id !== memberId);
      return [{ affectedRows: initialLength - this.members.length }];
    }
    
    if (sql.includes('SELECT') && sql.includes('users')) {
      return [this.users];
    }
    
    if (sql.includes('INSERT') && sql.includes('users')) {
      const newUser = {
        id: this.nextId++,
        ...params[1],
        created_at: new Date(),
        updated_at: new Date()
      };
      this.users.push(newUser);
      return [{ insertId: newUser.id }];
    }
    
    // Handle other tables
    if (sql.includes('SELECT') && sql.includes('payments')) {
      return [this.payments];
    }
    
    if (sql.includes('INSERT') && sql.includes('payments')) {
      const newPayment = {
        id: `P${this.nextId++}`,
        ...params[1],
        created_at: new Date()
      };
      this.payments.push(newPayment);
      return [{ insertId: newPayment.id }];
    }
    
    if (sql.includes('SELECT') && sql.includes('attendance')) {
      return [this.attendance];
    }
    
    if (sql.includes('INSERT') && sql.includes('attendance')) {
      const newAttendance = {
        id: `A${this.nextId++}`,
        ...params[1],
        created_at: new Date()
      };
      this.attendance.push(newAttendance);
      return [{ insertId: newAttendance.id }];
    }
    
    if (sql.includes('SELECT') && sql.includes('announcements')) {
      return [this.announcements];
    }
    
    if (sql.includes('INSERT') && sql.includes('announcements')) {
      const newAnnouncement = {
        id: `ANN${this.nextId++}`,
        ...params[1],
        created_at: new Date()
      };
      this.announcements.push(newAnnouncement);
      return [{ insertId: newAnnouncement.id }];
    }
    
    // Default response
    return [{ affectedRows: 1 }];
  }

  async getConnection() {
    return {
      query: this.query.bind(this),
      release: () => {}
    };
  }
}

const pool = new InMemoryDatabase();

// Test database connection
async function testConnection() {
  console.log('✅ Using in-memory database (development mode)');
  return true;
}

// Initialize database tables
async function initializeDatabase() {
  console.log('✅ In-memory database initialized with sample data');
}

module.exports = {
  pool,
  testConnection,
  initializeDatabase,
  usingInMemory: () => true
};
