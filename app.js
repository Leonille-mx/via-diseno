const express = require('express');
const path = require('path');
const port = process.env.PORT || 3000;

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', 'views');

const session = require('express-session');

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

app.use(session({
    secret: 'secret_key', 
    resave: false, //La sesión no se guardará en cada petición, sino sólo se guardará si algo cambió 
    saveUninitialized: false, //Asegura que no se guarde una sesión para una petición que no lo necesita
    cookie: { 
        maxAge: 1000 * 60 * 30, // la sesión tiene 30 minutos de vida
        secure: process.env.NODE_ENV === 'production' // Si es HTTPS, verdadero
    } 
}));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json());

const rutasUsuario = require('./routes/usuario.routes');
app.use('/usuario', rutasUsuario);

const rutasCoordinador = require('./routes/coordinador.routes');
app.use('/coordinador', rutasCoordinador);

const rutasAlumnoRegular = require('./routes/alumno-regular.routes');
app.use('/alumno-regular', rutasAlumnoRegular);

const rutasAlumnoIrregular = require('./routes/alumno-irregular.routes');
app.use('/alumno-irregular', rutasAlumnoIrregular);

app.use((req, res) => { res.status(404).render('404'); });

const rutasIndex = require('./routes/index.routes');

app.get('/', rutasIndex);

app.use((request, response, next) => {  
    response.status(404).send('Recurso No Encontrado'); 
});

app.listen(port);