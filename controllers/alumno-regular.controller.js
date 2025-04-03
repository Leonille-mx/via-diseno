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

exports.post_confirmar = (req, res, nxt) => {
    Alumno.delete(req.params.id)
        .then(() => {
            res.redirect('/alumno-regular/horario');
        })
        .catch((error) => {
            console.log(error);
        });
  };