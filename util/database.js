const { Pool } = require("pg"); // Import Pool from pg
const dotenv = require("dotenv");

// Load environment variables from a .env file
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool(
  isProduction
    ? { // Producción remota
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : { // Producción local
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
      }
);


pool.connect()
    .then(client => {
        console.log("Connected to PostgreSQL Database");
        client.release(); // Release the connection back to the pool
    })
    .catch(err => console.error("PostgreSQL Connection Error:", err
        
    ));

module.exports = pool; // Export the pool for use in models
