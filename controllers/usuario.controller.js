const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario.model');
const Alumno = require('../models/alumno.model');

exports.get_login = (req, res, nxt) => {
    res.render('login', {
        isLoggedIn: req.session.isLoggedIn || false,
        matricula: req.session.matricula || '',
    });
};

exports.post_login = (req, res, nxt) => {

    
    req.session.matricula = req.body.matricula;
    req.session.isLoggedIn = true;
    req.session.save(err => {
        if (err) {
            console.log(err);
            return res.redirect('/usuario/iniciar-sesion');
        }
        res.redirect('/coordinador/dashboard');
    });
};