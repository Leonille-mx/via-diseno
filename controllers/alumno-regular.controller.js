const path = require('path');

exports.get_horario = (req, res, nxt) => {
    res.render('horario_alumno_regular');
};

exports.get_ayuda = (req, res, nxt) => {
    res.render('ayuda_alumno_regular');
};

exports.get_prueba = (req, res, nxt) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'prueba_alumno.html'));
};