const { Pool } = require('pg'); 

const pool = new Pool({
    user: 'postgres', 
    password: 'London2018!?',
    host: 'localhost', 
    database: 'via-diseno', 
    port: 5432, 
    charset: 'utf8',  
});

module.exports = pool;