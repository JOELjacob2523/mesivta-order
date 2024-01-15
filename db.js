const config = require('./config.json');
const Knex = require('knex');

exports.knex = Knex({
    client: config.CLIENT,
    connection: {
        host: config.DB_SERVER,
        user: config.DB_USER,
        password: config.DB_PESS,
        database: config.DATABASE,
        port: config.DB_PORT || 3306,
    }
})