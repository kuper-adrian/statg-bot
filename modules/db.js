var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var logger = require('./log').getLogger();
var knex = require('knex');


const DB_FILE_NAME = 'stat-g-db.db';

const TABLES = {
    registeredPlayer: 'registered_player'
}


exports.knex = knex;
exports.TABLES = TABLES;

exports.init = function () {

    var dbFilePath = './' + DB_FILE_NAME;

    // create db file if it doesnt already exist
    if (fs.existsSync(dbFilePath)) {
        logger.info('database already exists.');
    } else {
        logger.info('creating database...');
        var db = new sqlite3.Database(dbFilePath);
        db.close();
    
        logger.info('creating database finished.');
    }
    
    knex = require('knex')({
        client: 'sqlite3',
        connection: {
            filename: dbFilePath
        },
        useNullAsDefault: true
    });

    logger.info('making sure all tables are there')
    // create tables if they dont exist
    knex.schema.hasTable(TABLES.registeredPlayer).then(exists => {

        if (!exists) {
          return knex.schema.createTable(TABLES.registeredPlayer, function(t) {
                t.increments('id').primary();
                t.text('discord_id');
                t.text('discord_name');
                t.text('pubg_id');
                t.text('pubg_name');                
            });
        }
    });
}