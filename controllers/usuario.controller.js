exports.get_login = (req, res, nxt) => {
    res.render('login', {
        isLoggedIn: req.session.isLoggedIn || false,
        matricula: req.session.matricula || '',
    });
};

exports.post_login = (req, res, nxt) => {
    req.session.matricula = req.body.matricula;
    req.session.isLoggedIn = true;
    res.redirect('/coordinador/dashboard');
};