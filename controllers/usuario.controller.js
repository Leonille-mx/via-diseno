exports.get_login = (req, res, nxt) => {
    res.render('login');
};

exports.post_login = (req, res, nxt) => {
    res.redirect('/coordinador/dashboard');
};