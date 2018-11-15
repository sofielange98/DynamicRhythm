var pgp = require('pg-promise')();

const dbConfig = {
   host: 'localhost',
   port: 5433,
   database: 'DynamicRhythm',
   user: 'postgres',
   password: 'Password' // TODO: Fill in your PostgreSQL password here.
                // Use empty string if you did not set a password
};

var db = pgp(dbConfig);

module.exports = db;
