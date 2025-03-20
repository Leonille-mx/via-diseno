const { insertProfessors } = require('./professorsModel');  // Importamos el modelo de profesores

app.get('/v1/users/professors', async (req, res) => {
  try {
    const professors = await getAllProfessors();  // Obtener los profesores de la API
    await insertProfessors(professors);  // Insertar los profesores en la base de datos
    res.send(professors);  // Devuelves los profesores como respuesta
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching professors');
  }
});
