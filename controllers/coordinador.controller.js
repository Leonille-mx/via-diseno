
const CicloEscolar = require('../models/ciclo-escolar.model');
const adminApiClient = require('../adminApiClient');


exports.get_dashboard = (req, res) => {
    try {
        const msg = req.query.msg || null;  
        res.render('dashboard_coordinador', {
            msg: msg 
        });
    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).send("Error loading dashboard");
    }
};

exports.postSincronizarCicloEscolar = async (req, res) => {
    try {
        res.redirect(`/coordinador/dashboard?msg=${encodeURIComponent(msg)}`);
    } catch (error) {
        res.redirect(`/coordinador/dashboard?msg=${encodeURIComponent('Error message')}`);
    }
};

exports.get_materias = (req, res, nxt) => {
    res.render('materias_coordinador');
};

exports.get_profesores = (req, res, nxt) => {
    res.render('profesores_coordinador');
};

exports.get_salones = (req, res, nxt) => {
    res.render('salones_coordinador');
};

exports.get_grupos = (req, res, nxt) => {
    res.render('grupos_coordinador');
};

exports.get_alumnos = (req, res, nxt) => {
    res.render('alumnos_coordinador');
};

exports.get_solicitudes_cambio = (req, res, nxt) => {
    res.render('solicitudes_cambio_coordinador');
};

exports.get_ayuda = (req, res, nxt) => {
    res.render('ayuda_coordinador');
};

exports.get_cicloescolar = (req, res, next) => {
    CicloEscolar.fetchAll()
        .then((result) => {
            const formattedData = result.rows.map(row => ({
                ...row,
                fecha_inicio: new Date(row.fecha_inicio),
                fecha_fin: new Date(row.fecha_fin)
            }));
            
            res.render('ciclo_escolar_coordinador', {
                cicloescolar: formattedData,
                msg: req.query.msg || null
            });
        })
        .catch((error) => {
            console.error("Critical DB Error:", error);
            res.status(500).send(`
                <h1>Database Error</h1>
                <p>Failed to load school cycles. Please try again later.</p>
                <a href="/coordinador/ciclo-escolar">Retry</a>
            `);
        });
    };

    exports.postSincronizarCicloEscolar = async (req, res) => {
        try {
          const externalData = await adminApiClient.getCiclosEscolares();
          const result = await CicloEscolar.sincronizarConAPI(externalData);
      
          let msg = `Sincronización completada:<br>
                    Insertados: ${result.inserted}<br>
                    Actualizados: ${result.updated}<br>
                    Eliminados: ${result.deleted}`;
      
          if (result.invalid.length > 0) {
            msg += `<br><br>Registros omitidos (fecha_fin ≤ fecha_inicio):<br>`;
            msg += result.invalid.map(r => 
              `${r.code}: ${r.start} → ${r.end}`
            ).join('<br>');
          }
      
          res.redirect(`/coordinador/dashboard?msg=${encodeURIComponent(msg)}`);
          
        } catch (error) {
          console.error("Error en sincronización:", error);
          res.redirect(`/coordinador/dashboard?msg=${encodeURIComponent('Error: ' + error.message)}`);
        }
    };
    


