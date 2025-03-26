const pool = require('../util/database')

const pool = require('../util/database');

module.exports = class Usuario {
    constructor(mi_ivd_id, mi_contrasena, mi_nombre, mi_primer_apellido, mi_segundo_apellido, mi_correo_institucional, mi_role_id) {
        this.ivd_id = mi_ivd_id;
        this.contrasena = mi_contrasena;
        this.nombre = mi_nombre;
        this.primer_apellido = mi_primer_apellido;
        this.segundo_apellido = mi_segundo_apellido;
        this.correo_institucional = mi_correo_institucional;
        this.role_id = mi_role_id;
    }

    static async sincronizarUsuarios() {

    }
};