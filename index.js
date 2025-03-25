const pool = require('./database');

const getTables = async () => {
  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public';
    `);
    console.log('Tablas en la base de datos:', result.rows);
  } catch (error) {
    console.error('Error al obtener las tablas:', error);
  } finally {
    pool.end(); // Cierra la conexión
  }
};

getTables();

