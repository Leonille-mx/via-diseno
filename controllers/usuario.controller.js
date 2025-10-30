const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario.model');
const Alumno = require('../models/alumno.model');
const sgMail = require('@sendgrid/mail');
const dotenv = require("dotenv");

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
            nombre: `${usuario.nombre} ${usuario.primer_apellido} ${usuario.segundo_apellido ? usuario.segundo_apellido : ''}`,
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

    // Creating new secure random token
    const token = uuidv4();
    tokens[token] = {
        ivd_id: matricula,
        expires_at: Date.now() + 30 * 60 * 1000 // 30 min
    };

    dotenv.config();

    const link = `${process.env.BASE_URL}/usuario/recuperar/${token}`;
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // const transporter = nodemailer.createTransport({
    //     host: 'smtp.sendgrid.net',
    //     port: 587,
    //     auth: {
    //         user: 'apikey',
    //         pass: process.env.SENDGRID_API_KEY,
    //     },
    // });


    const msg = {
        to: usuario.correo_institucional,
        from: '"IVD Inscripciones" <avisos@inscripciones.ivd.edu.mx>',
        subject: 'Registrar nueva contraseña - IVD Inscripciones',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8" />
                <title>Restablecer contraseña</title>
            </head>
            <body style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 20px; margin: 0;">
                <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                    <td align="center">
                    <table width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 30px;">
                        <tr>
                        <td align="center" style="padding-bottom: 20px;">
                            <h2 style="color: #333;">IVD Inscripciones</h2>
                        </td>
                        </tr>
                        <tr>
                        <td style="color: #333; font-size: 16px;">
                            <p>Hola,</p>
                            <p>Hemos recibido una solicitud para registrar una nueva contraseña para tu cuenta.</p>
                            <p>Haz clic en el siguiente botón para continuar:</p>
                            <p style="text-align: center; margin: 30px 0;">
                            <a href="${link}" style="background-color: #007BFF; color: white; text-decoration: none; padding: 12px 24px; border-radius: 5px; display: inline-block;">Restablecer contraseña</a>
                            </p>
                            <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
                            <p style="margin-top: 30px;">Saludos,<br/>Equipo de IVD Inscripciones</p>
                        </td>
                        </tr>
                        <tr>
                        <td align="center" style="font-size: 12px; color: #888; padding-top: 30px;">
                            © 2025 IVD Inscripciones. Todos los derechos reservados.
                        </td>
                        </tr>
                    </table>
                    </td>
                </tr>
                </table>
            </body>
            </html>
        `,
        trackingSettings: {
            clickTracking: { enable: false, enableText: false },
        },
    };

    await sgMail.send(msg);
    // await transporter.sendMail({
    //     from: '"IVD Inscripciones" <avisos@inscripciones.ivd.edu.mx>',
    //     to: usuario.correo_institucional,
    //     subject: 'Registrar nueva contraseña - IVD Inscripciones',
    //     html: `
    //         <!DOCTYPE html>
    //         <html>
    //         <head>
    //             <meta charset="UTF-8" />
    //             <title>Restablecer contraseña</title>
    //         </head>
    //         <body style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 20px; margin: 0;">
    //             <table width="100%" cellspacing="0" cellpadding="0">
    //             <tr>
    //                 <td align="center">
    //                 <table width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 30px;">
    //                     <tr>
    //                     <td align="center" style="padding-bottom: 20px;">
    //                         <h2 style="color: #333;">IVD Inscripciones</h2>
    //                     </td>
    //                     </tr>
    //                     <tr>
    //                     <td style="color: #333; font-size: 16px;">
    //                         <p>Hola,</p>
    //                         <p>Hemos recibido una solicitud para registrar una nueva contraseña para tu cuenta.</p>
    //                         <p>Haz clic en el siguiente botón para continuar:</p>
    //                         <p style="text-align: center; margin: 30px 0;">
    //                         <a href="${link}" style="background-color: #007BFF; color: white; text-decoration: none; padding: 12px 24px; border-radius: 5px; display: inline-block;">Restablecer contraseña</a>
    //                         </p>
    //                         <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
    //                         <p style="margin-top: 30px;">Saludos,<br/>Equipo de IVD Inscripciones</p>
    //                     </td>
    //                     </tr>
    //                     <tr>
    //                     <td align="center" style="font-size: 12px; color: #888; padding-top: 30px;">
    //                         © 2025 IVD Inscripciones. Todos los derechos reservados.
    //                     </td>
    //                     </tr>
    //                 </table>
    //                 </td>
    //             </tr>
    //             </table>
    //         </body>
    //         </html>
    //     `,
    //     trackingSettings: {
    //         clickTracking: { enable: false, enableText: false }
    //     }
    // });

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

exports.post_cerrar_session = (req, res) => {
    req.session.destroy(err => {
        if (err) return res.redirect('/');
        res.redirect('/usuario/iniciar-sesion');
    });
};
