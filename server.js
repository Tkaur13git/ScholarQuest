const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database setup
const dbPath = path.join(__dirname, 'scholarship.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      major TEXT NOT NULL,
      gender TEXT NOT NULL,
      leadership BOOLEAN DEFAULT 0,
      community BOOLEAN DEFAULT 0,
      total_xp INTEGER DEFAULT 0,
      level TEXT DEFAULT 'Scholarship Newbie',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Applications table
  db.run(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      scholarship_id INTEGER NOT NULL,
      scholarship_name TEXT NOT NULL,
      xp_earned INTEGER NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Scholarships table (for reference)
  db.run(`
    CREATE TABLE IF NOT EXISTS scholarships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      criteria TEXT NOT NULL,
      reward INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert sample scholarships if they don't exist
  const sampleScholarships = [
    {
      name: "STEM Stars Scholarship",
      description: "For students majoring in STEM fields.",
      criteria: JSON.stringify({ major: ["Engineering", "Computer Science", "Mathematics", "Physics"] }),
      reward: 100
    },
    {
      name: "Future Leaders Award",
      description: "For students with leadership experience.",
      criteria: JSON.stringify({ age: [18, 19, 20, 21, 22], major: ["Business", "Political Science"] }),
      reward: 80
    },
    {
      name: "Creative Minds Grant",
      description: "For students in creative majors.",
      criteria: JSON.stringify({ major: ["Art", "Design", "Music", "Literature"] }),
      reward: 90
    },
    {
      name: "Community Hero Scholarship",
      description: "For students with community service experience.",
      criteria: JSON.stringify({}),
      reward: 70
    },
    {
      name: "Women in Tech Scholarship",
      description: "For women in technology-related majors.",
      criteria: JSON.stringify({ major: ["Computer Science", "Engineering"], gender: ["Female"] }),
      reward: 120
    }
  ];

  // Check if scholarships exist
  db.get("SELECT COUNT(*) as count FROM scholarships", (err, row) => {
    if (err) {
      console.error('Error checking scholarships:', err);
      return;
    }
    
    if (row.count === 0) {
      const stmt = db.prepare(`
        INSERT INTO scholarships (name, description, criteria, reward)
        VALUES (?, ?, ?, ?)
      `);
      
      sampleScholarships.forEach(scholarship => {
        stmt.run(scholarship.name, scholarship.description, scholarship.criteria, scholarship.reward);
      });
      
      stmt.finalize();
      console.log('Sample scholarships inserted');
    }
  });
});

// Helper function to calculate level based on XP
function getLevel(xp) {
  if (xp >= 300) return "Scholarship Master";
  if (xp >= 200) return "Scholarship Pro";
  if (xp >= 100) return "Scholarship Explorer";
  if (xp >= 50) return "Scholarship Novice";
  return "Scholarship Newbie";
}

// API Routes

// Get all scholarships
app.get('/api/scholarships', (req, res) => {
  db.all("SELECT * FROM scholarships", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const scholarships = rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      criteria: JSON.parse(row.criteria),
      reward: row.reward
    }));
    
    res.json(scholarships);
  });
});

// Create or update user profile
app.post('/api/users', (req, res) => {
  const { name, age, major, gender, leadership, community } = req.body;
  
  if (!name || !age || !major || !gender) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if user already exists (by name for simplicity)
  db.get("SELECT * FROM users WHERE name = ?", [name], (err, existingUser) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (existingUser) {
      // Update existing user
      db.run(`
        UPDATE users 
        SET age = ?, major = ?, gender = ?, leadership = ?, community = ?, updated_at = CURRENT_TIMESTAMP
        WHERE name = ?
      `, [age, major, gender, leadership ? 1 : 0, community ? 1 : 0, name], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        res.json({
          id: existingUser.id,
          name,
          age,
          major,
          gender,
          leadership,
          community,
          total_xp: existingUser.total_xp,
          level: getLevel(existingUser.total_xp),
          message: 'Profile updated successfully'
        });
      });
    } else {
      // Create new user
      db.run(`
        INSERT INTO users (name, age, major, gender, leadership, community)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [name, age, major, gender, leadership ? 1 : 0, community ? 1 : 0], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        res.json({
          id: this.lastID,
          name,
          age,
          major,
          gender,
          leadership,
          community,
          total_xp: 0,
          level: 'Scholarship Newbie',
          message: 'Profile created successfully'
        });
      });
    }
  });
});

// Get user profile
app.get('/api/users/:name', (req, res) => {
  const { name } = req.params;
  
  db.get("SELECT * FROM users WHERE name = ?", [name], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: row.id,
      name: row.name,
      age: row.age,
      major: row.major,
      gender: row.gender,
      leadership: Boolean(row.leadership),
      community: Boolean(row.community),
      total_xp: row.total_xp,
      level: getLevel(row.total_xp),
      created_at: row.created_at,
      updated_at: row.updated_at
    });
  });
});

// Apply to scholarship
app.post('/api/applications', (req, res) => {
  const { userId, scholarshipId, scholarshipName, xpEarned } = req.body;
  
  if (!userId || !scholarshipId || !scholarshipName || !xpEarned) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if user already applied to this scholarship
  db.get(`
    SELECT * FROM applications 
    WHERE user_id = ? AND scholarship_id = ?
  `, [userId, scholarshipId], (err, existingApplication) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (existingApplication) {
      return res.status(400).json({ error: 'Already applied to this scholarship' });
    }

    // Create application record
    db.run(`
      INSERT INTO applications (user_id, scholarship_id, scholarship_name, xp_earned)
      VALUES (?, ?, ?, ?)
    `, [userId, scholarshipId, scholarshipName, xpEarned], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Update user's total XP
      db.run(`
        UPDATE users 
        SET total_xp = total_xp + ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [xpEarned, userId], (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        res.json({
          applicationId: this.lastID,
          message: 'Application submitted successfully',
          xpEarned: xpEarned
        });
      });
    });
  });
});

// Get user's applications
app.get('/api/users/:userId/applications', (req, res) => {
  const { userId } = req.params;
  
  db.all(`
    SELECT * FROM applications 
    WHERE user_id = ? 
    ORDER BY applied_at DESC
  `, [userId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json(rows);
  });
});

// Get all users (for admin purposes)
app.get('/api/users', (req, res) => {
  db.all(`
    SELECT u.*, COUNT(a.id) as applications_count
    FROM users u
    LEFT JOIN applications a ON u.id = a.user_id
    GROUP BY u.id
    ORDER BY u.total_xp DESC
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const users = rows.map(row => ({
      id: row.id,
      name: row.name,
      age: row.age,
      major: row.major,
      gender: row.gender,
      leadership: Boolean(row.leadership),
      community: Boolean(row.community),
      total_xp: row.total_xp,
      level: getLevel(row.total_xp),
      applications_count: row.applications_count,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
    
    res.json(users);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ScholarQuest API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ScholarQuest API server running on port ${PORT}`);
  console.log(`📊 Database initialized at: ${dbPath}`);
  console.log(`🌐 API endpoints available at: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('✅ Database connection closed');
    }
    process.exit(0);
  });
});
