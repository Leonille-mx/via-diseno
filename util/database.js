const { Pool } = require("pg");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: String(process.env.DB_PASSWORD), // Force string conversion
    port: process.env.DB_PORT,
    ssl: false // Add if not using SSL
  });

module.exports = pool; // 👈 This is crucial for other files to use the pool