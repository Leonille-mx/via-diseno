const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario.model');
const Alumno = require('../models/alumno.model');

exports.get_login = (req, res, nxt) => {
    res.render('login', {
        isLoggedIn: req.session.isLoggedIn || false,
        matricula: req.session.matricula || '',
    });
};

exports.post_login = async (req, res, nxt) => {
    const { matricula, password } = req.body

    try {
        const usuario = await Usuario.findByCorreo(matricula);
        const passwordValida = await bcrypt.compare(password, usuario.contrasena);

        if (!usuario || !passwordValida) {
            return res.status(401).send('Usuario o Contraseña inválido(s)');
        }

        req.session.isLoggedIn = true;
        req.session.usuario = {
            id: usuario.ivd_id,
            rol_id: usuario.role_id,
        };

        if (usuario.role_id === 1) {
            return req.session.save(() => res.redirect('/coordinador/dashboard'));
        } else if (usuario.role_id === 2) {
            const alumno = await Alumno.findByUsuarioId(usuario.ivd_id);
            return req.session.save(() => {
                if (alumno.regular) {
                    res.redirect('/alumno-regular/horario');
                } else {
                    res.redirect('/alumno-irregular/modificar-horario');
                }
            });
        } else {
            res.status(403).send('Error en el almacenamiento del Rol');
        }

    } catch (error) {
        console.error('Error en el login: ', error)
    }
};