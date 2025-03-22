const pool = require('./database');

const insertProfessors = async (professors) => {
  for (const prof of professors) {
    await pool.query('INSERT INTO professors (name, email) VALUES ($1, $2)', [prof.name, prof.email]);
  }
};

module.exports = { insertProfessors };
