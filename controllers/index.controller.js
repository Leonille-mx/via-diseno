exports.get_index = (req, res, nxt) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/usuario/iniciar-sesion');
    } else {
        return res.redirect('/coordinador/dashboard');
    }
}