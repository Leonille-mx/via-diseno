const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

pool.connect()
  .then(client => {
        console.log("Connected to PostgreSQL Database");
        client.release(); // Release the connection back to the pool
    })
    .catch(err => console.error("PostgreSQL Connection Error:", err));


module.exports = pool;