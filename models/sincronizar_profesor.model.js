const axios = require('axios');
const pool = require('../util/database');
const NodeCache = require('node-cache');
const dotenv = require('dotenv');

dotenv.config();
const cache = new NodeCache();

const axiosAdminClient = axios.create({
  baseURL: process.env.ADMIN_API_URL,
});

// Obtener el token de autenticación
async function getToken() {
  let token = cache.get('token');
  if (token) return token;

  console.log('Fetching new token');
  const m2m_credentials = {
    client_id: process.env.ADMIN_API_M2M_CLIENT_ID,
    client_secret: process.env.ADMIN_API_M2M_CLIENT_SECRET,
  };

  const response = await axiosAdminClient.post('/m2m/authenticate', m2m_credentials);
  token = response.data.token;
  cache.set('token', token);
  return token;
}

// Obtener todos los profesores desde la API
async function getAllProfessors() {
  const token = await getToken();
  const headers = { Authorization: `Bearer ${token}` };

  const response = await axiosAdminClient.get('v1/users/all', {
    headers,
    params: {
      type: 'Users::Professor',
    },
  });

  // Mapear los datos de la API al formato requerido
  return response.data.map((profesor) => ({
    ivd_id: profesor.ivd_id,
    nombre: profesor.nombre,
    primer_apellido: profesor.primer_apellido,
    segundo_apellido: profesor.segundo_apellido,
    activo: profesor.activo || true,
  }));
}

// Insertar profesores en la base de datos
async function sincronizar() {
  try {
    const profesores = await getAllProfessors();

    for (const profesor of profesores) {
      const query = {
        text: `
          INSERT INTO profesores(ivd_id, nombre, primer_apellido, segundo_apellido, activo)
          VALUES($1, $2, $3, $4, $5)
          ON CONFLICT(ivd_id) DO NOTHING
        `,
        values: [
          profesor.ivd_id,
          profesor.nombre,
          profesor.primer_apellido,
          profesor.segundo_apellido,
          profesor.activo,
        ],
      };
      await pool.query(query);
    }

    console.log('Profesores sincronizados correctamente');
    return { success: true, message: 'Profesores sincronizados correctamente' };
  } catch (error) {
    console.error('Error sincronizando profesores:', error);
    throw error;
  }
}

module.exports = { sincronizar };
