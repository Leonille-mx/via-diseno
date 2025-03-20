const pool = require('./database');  // Importa la conexión a la base de datos

// Función para insertar profesores en la base de datos
async function insertProfessors(professors) {
  try {
    // Itera sobre los datos de los profesores y realiza una inserción para cada uno
    for (let professor of professors) {
      // Asume que los datos del profesor tienen 'id', 'name', 'email', etc.
      await pool.query(
        'INSERT INTO professors (id, name, email) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
        [professor.id, professor.name, professor.email]  // Ajusta los campos según los datos de la API
      );
    }
    console.log('Profesores insertados correctamente');
  } catch (error) {
    console.error('Error al insertar profesores', error);
    throw error;  // Lanzamos el error para manejarlo más tarde
  }
}

// Exportar la función para usarla en otros archivos
module.exports = { insertProfessors };
