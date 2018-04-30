var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var logger = require('../log').getLogger();

const DB_FILE_NAME = 'stat-g-db.db';

exports.createDb = function () {

    // do nothing if database file already exits
    if (fs.existsSync(DB_FILE_NAME)) {
        logger.info('database already exists.');
        return;
    }

    logger.info('reading sql script...');
    var createDbSql = fs.readFileSync('./modules/db/scripts/create-statg-db.sql').toString('utf8');

    logger.info('creating database...');
    var db = new sqlite3.Database(DB_FILE_NAME);

    
    // execute script
    db.serialize(function () {

        logger.info('executing sql script...');
        db.run(createDbSql);
    });

    logger.info('closing db...');
    db.close();

    logger.info('creating database finished.');
}

// ---------------------------------------------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------------------------------------------
var registedPlayerCrud = require('./crud/registered_player');
var registered_player = {
    create: function (discord_id, discord_name, pubg_id, pubg_name) {
        var db = new sqlite3.Database(DB_FILE_NAME);
        registedPlayerCrud.create(db, discord_id, discord_name, pubg_id, pubg_name);
        db.close();
    },
    read: null,
    update: null,
    delete: null
}
exports.registered_player = registered_player;

