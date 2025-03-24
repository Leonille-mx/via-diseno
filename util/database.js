const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD, // Remove the extra parenthesis
  port: process.env.DB_PORT,
  ssl: false,
  connectionTimeoutMillis: 2000
});

// Add connection test
pool.query('SELECT NOW()')
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error:', err));

module.exports = pool; // Ensure proper export