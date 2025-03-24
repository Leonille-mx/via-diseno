const Profesor = require('../models/profesor.model.js');
const { getAllProfessors } = require('../adminApiClient');

exports.get_dashboard = (req, res, nxt) => {
    res.render('dashboard_coordinador');
};

exports.get_profesores = async (req, res, nxt) => {
  try {
    const profesoresDB = await Profesor.fetchAll();  
    const msg = req.query.msg || null;

    res.render('profesores_coordinador', {
        profesores: profesoresDB.rows,  
        msg, 
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Hubo un problema al obtener los profesores.');
  }
};

exports.post_sincronizar_profesores = async (req, res, nxt) => {
    try {
        const courses = await getAllProfessors(); 
        const profesoresApi = courses.data; 
        
        const resultado = await Profesor.sincronizarProfesores(profesoresApi);  
        const msg = `La operación fue exitosa!<br>
                    Insertado: ${resultado.inserted}<br>
                    Actualizado: ${resultado.updated}<br>
                    Eliminado: ${resultado.deleted}`;
        res.redirect(`/coordinador/profesores?msg=${encodeURIComponent(msg)}`);
    } catch (error) {
        console.error(error);
        res.redirect(`/coordinador/profesores?msg=${encodeURIComponent('La operación fue fracasada')}`);
    }
};

exports.post_eliminar_profesor = (req, res, nxt) => {
  Profesor.delete(req.params.id)
      .then(() => {
          res.redirect('/coordinador/profesores');
      })
      .catch((error) => {
          console.log(error);
      });
};

exports.get_materias = (req, res, nxt) => {
    res.render('materias_coordinador');
};

exports.get_salones = (req, res, nxt) => {
    res.render('salones_coordinador');
};

exports.get_grupos = (req, res, nxt) => {
    res.render('grupos_coordinador');
};

exports.get_alumnos = (req, res, nxt) => {
    res.render('alumnos_coordinador');
};

exports.get_solicitudes_cambio = (req, res, nxt) => {
    res.render('solicitudes_cambio_coordinador');
};

exports.get_ayuda = (req, res, nxt) => {
    res.render('ayuda_coordinador');
};