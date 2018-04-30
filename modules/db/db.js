var fs = require('fs');
const DB_FILE_NAME = 'stat-g-db.db';

exports.createDb = function () {

    // do nothing if database file already exits
    if (fs.existsSync(DB_FILE_NAME)) {
        return;
    }

    var db = new sqlite3.Database(DB_FILE_NAME);

    db.serialize(function () {
        logger.info('Creating table \"registered_player\"...')
        db.run("CREATE TABLE registered_player (id INTEGER PRIMARY KEY, discord_name TEXT, discord_id TEXT, pubg_name TEXT, pubg_id TEXT)");
    });

    db.close();
}