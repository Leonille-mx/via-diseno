const Alumno = require('../models/alumno.model');

module.exports = {
    estaAutenticado: (req, res, nxt) => {
        if (!req.session.isLoggedIn) {
            return res.redirect('/usuario/iniciar-sesion'); 
        }
        nxt();
    },

    esCoordinador: (req, res, nxt) => {
        if (req.session.usuario?.rol_id !== 1) {
            return res.status(404).render('404');
        }
        nxt();
    },

    esAlumnoRegular: async (req, res, nxt) => {
        if (req.session.usuario?.rol_id !== 2) {
            return res.status(404).render('404');
        }

        const alumno = await Alumno.findAlumnoById(req.session.usuario.id);
        if (!alumno?.regular) {
            return res.status(404).render('404');
        }

        nxt();
    },

    esAlumnoIrregular: async (req, res, nxt) => {
        if (req.session.usuario?.rol_id !== 2) {
            return res.status(404).render('404');
        }

        const alumno = await Alumno.findAlumnoById(req.session.usuario.id);
        if (alumno?.regular) {
            return res.status(404).render('404');
        }

        nxt();
    }

};