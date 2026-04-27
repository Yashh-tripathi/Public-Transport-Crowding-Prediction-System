const {Pool} = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'transport_system',
    password: 'Yash@@2400',
    port: 5432
});

module.exports = pool;