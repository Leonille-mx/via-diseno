const { Pool } = require('pg');
const dotenv = require('dotenv');

// Cargar las variables de entorno desde un archivo .env
dotenv.config();

// Configuración de la conexión a la base de datos PostgreSQL
const pool = new Pool({
  host: "localhost",          // Host del servidor de PostgreSQL
  user: "postgres",          // Usuario para la conexión
  password: "London2018!?",  // Contraseña para la conexión
  database: "via-diseno",    // Nombre de la base de datos
  port: "5432",              // Puerto en el que escucha PostgreSQL
});

module.exports = pool; // Exporta el pool de conexiones
