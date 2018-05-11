var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var logger = require('./log').getLogger();
var knex = require('knex');

const DB_FILE_NAME = 'stat-g-db.db';

const TABLES = {
    registeredPlayer: 'registered_player',
    region: 'region'
}



exports.TABLES = TABLES;

exports.init = function () {

    const dbFilePath = './' + DB_FILE_NAME;

    // create db file if it doesnt already exist
    if (fs.existsSync(dbFilePath)) {
        logger.info('database at path"' + dbFilePath + '" already exists.');
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
    knex.schema.hasTable(TABLES.registeredPlayer)
        .then(exists => {

            if (!exists) {
            return knex.schema.createTable(TABLES.registeredPlayer, function(t) {
                    t.increments('id').primary();
                    t.text('discord_id');
                    t.text('discord_name');
                    t.text('pubg_id');
                    t.text('pubg_name');                
                });
            }
        })
        .catch(error => {
            logger.error(error);
        });

    knex.schema.hasTable(TABLES.region)
        .then(exists => {

            if (!exists) {
                return knex.schema.createTable(TABLES.region, t => {
                    t.increments('id').primary();
                    t.text('region_name');
                })
            }
        })
        .then(o => {
            return knex(TABLES.region).insert([
                { region_name: 'pc-na' },
                { region_name: 'pc-eu' },
                { region_name: 'pc-ru' },
                { region_name: 'pc-oc' },
                { region_name: 'pc-kakao' },
                { region_name: 'pc-sea' },
                { region_name: 'pc-sa' },
                { region_name: 'pc-as' },
                { region_name: 'pc-jp' },
                { region_name: 'pc-krjp' },
                { region_name: 'xbox-as' },
                { region_name: 'xbox-eu' },
                { region_name: 'xbox-na' },
                { region_name: 'xbox-oc' }
            ])
        })
        .catch(error => {
            logger.error(error);
        });

    exports.knex = knex;
}