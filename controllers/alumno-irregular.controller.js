exports.get_horario = (req, res, nxt) => {
    res.render('horario_alumno_irregular');
};

exports.get_ayuda = (req, res, nxt) => {
    res.render('ayuda_alumno_irregular');
};

exports.get_editar_horario = (req, res, nxt) => {
    res.render('editar_horario_alumno_irregular');
};

exports.get_prevista_horario = (req, res, nxt) => {
    res.render('prevista_horario_alumno_irregular');
};