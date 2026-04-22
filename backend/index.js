const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' }); // Read from parent .env if run locally

const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// DB Connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const fs = require('fs');
const path = require('path');

// otorun db init.sql on startup
const bcrypt = require('bcryptjs');

async function initDB(retries = 5) {
  try {
    const initScript = fs.readFileSync(path.join(__dirname, 'db', 'init.sql'), 'utf8');
    await pool.query(initScript);
    
    await pool.query('ALTER TABLE meetings ADD COLUMN IF NOT EXISTS message TEXT');
    await pool.query("ALTER TABLE meetings ALTER COLUMN proposed_times DROP NOT NULL");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(255);");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS domain VARCHAR(255);");
    await pool.query("ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS target VARCHAR(255);");
    await pool.query("ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS details TEXT;");
    
    const validHash = await bcrypt.hash('password123', 10);
    await pool.query(`UPDATE users SET password_hash = $1 WHERE email IN ('admin@hacettepe.edu.tr', 'j.smith@cambridge.ac.uk', 'm.chen@stanford.edu', 't.becker@tum.edu')`, [validHash]);

    console.log('Database schema ensured and Seed Data injected securely.');
  } catch (error) {
    console.error('Error initializing database schema:', error.message);
    if (retries > 0) {
      console.log(`Retrying DB initialization in 3 seconds... (${retries} attempts left)`);
      setTimeout(() => initDB(retries - 1), 3000);
    }
  }
}

initDB();

app.get('/', (req, res) => {
  res.send('HealthTech Co-Creation API is running!');
});

app.use('/api/auth', require('./routes/auth')(pool));
app.use('/api/posts', require('./routes/posts')(pool));
app.use('/api/meetings', require('./routes/meetings')(pool));
app.use('/api/admin', require('./routes/admin')(pool));

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
