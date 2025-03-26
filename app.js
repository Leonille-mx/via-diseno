const express = require('express');
const path = require('path');
const port = 3000;

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', 'views');

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

app.use((request, response, next) => {  
    response.status(404).send('Recurso No Encontrado'); 
});

app.listen(port);