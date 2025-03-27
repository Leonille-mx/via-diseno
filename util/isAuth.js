module.exports = (req, res, nxt) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/usuario/iniciar-sesion'); 
    }
    nxt();
};