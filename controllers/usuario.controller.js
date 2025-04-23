const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario.model');
const Alumno = require('../models/alumno.model');
const nodemailer = require('nodemailer');

const tokens = {};

exports.get_login = (req, res, nxt) => {
    res.render('login', {
        isLoggedIn: req.session.isLoggedIn || false,
        matricula: req.session.matricula || '',
    });
};

exports.post_login = async (req, res, nxt) => {
    const { matricula, password } = req.body

    try {
        if (!matricula || !password) {
            return res.render('login', {
                error: 'Debes ingresar matrícula y contraseña.',
                isLoggedIn: false,
                matricula: ''
            });
        }

        const usuario = await Usuario.findUsuarioById(matricula);

        if (!usuario || !usuario.contrasena) {
            return res.render('login', {
                error: 'Usuario o contraseña incorrectos.',
                isLoggedIn: false,
                matricula: ''
            });
        }

        const passwordValida = await bcrypt.compare(password, usuario.contrasena);

        if (!passwordValida) {
            return res.render('login', {
                error: 'Usuario o contraseña incorrectos.',
                isLoggedIn: false,
                matricula: ''
            });
        }

        req.session.isLoggedIn = true;
        req.session.usuario = {
            id: usuario.ivd_id,
            rol_id: usuario.role_id,
            nombre: `${usuario.nombre} ${usuario.primer_apellido} ${usuario.segundo_apellido}`,
            correo: usuario.correo_institucional
        };
          

        if (usuario.role_id === 1) {
            return req.session.save(() => res.redirect('/coordinador/dashboard'));
        } else if (usuario.role_id === 2) {
            const alumno = await Alumno.findAlumnoById(usuario.ivd_id);
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

exports.mostrarFormulario = (req, res) => {
    res.render('recuperar');
};

exports.enviarCorreoContrasena = async (req, res) => {
    const { matricula } = req.body;
    const usuario = await Usuario.findUsuarioById(matricula);

    if (!usuario) {
        return res.render('recuperar', { error: 'Matrícula no registrada' });
    }

    const token = uuidv4();
    tokens[token] = {
        ivd_id: matricula,
        expires_at: Date.now() + 30 * 60 * 1000 // 30 min
    };

    const link = `http://localhost:3000/usuario/recuperar/${token}`;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'armandofu0705@gmail.com',
            pass: 'ibhr rhdw pneb wuqi'
        }
    });

    await transporter.sendMail({
        from: 'IVD inscripciones',
        to: usuario.correo_institucional,
        subject: 'Registrar nueva contraseña',
        html: `<p>Haz clic en el siguiente enlace para registrar una nueva contraseña:</p><a href="${link}">${link}</a>`
    });

    res.render('recuperar', { mensaje: 'Se envió un enlace a tu correo institucional.' });
};

exports.mostrarFormularioNuevaContrasena = (req, res) => {
    const { token } = req.params;
    const data = tokens[token];

    if (!data || data.expires_at < Date.now()) {
        return res.render('recuperar', { error: 'Token inválido o expirado' });
    }

    res.render('nueva_contrasena', { token });
};

exports.guardarNuevaContrasena = async (req, res) => {
    const { token, password } = req.body;
    const data = tokens[token];

    if (!data || data.expires_at < Date.now()) {
        return res.render('recuperar', { error: 'Token inválido o expirado' });
    }

    const hash = await bcrypt.hash(password, 10);
    await Usuario.actualizarContrasena(data.ivd_id, hash);

    delete tokens[token];

    res.redirect('/usuario/iniciar-sesion');
};


