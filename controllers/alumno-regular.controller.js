exports.get_horario = (req, res, nxt) => {
    res.render('horario_alumno_regular', {
        isLoggedIn: req.session.isLoggedIn || false,
        matricula: req.session.matricula || '',
    });
};

exports.get_ayuda = (req, res, nxt) => {
    res.render('ayuda_alumno_regular', {
        isLoggedIn: req.session.isLoggedIn || false,
        matricula: req.session.matricula || '',
    });

};
