const config = require('./config.json');
const Knex = require('knex');

exports.Knex = knex({
    client: 'mysql2',
    connection: {
        host: config.DB_SERVER,
        user: config.DB_USER,
        password: config.DB_PESS,
        database: config.DATABASE,
        port: config.DB_PORT || 1433
    }
})