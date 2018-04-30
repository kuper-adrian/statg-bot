const TABLE_NAME = 'registered_player';

exports.create = function (db, discord_id, discord_name, pubg_id, pubg_name) {

    db.serialize(function () {
        var stmt = db.prepare("INSERT INTO registered_player (discord_id, discord_name, pubg_id, pubg_name) VALUES (?, ?, ?, ?)");
        stmt.run(discord_id, discord_name, pubg_id, pubg_name);
        stmt.finalize();
    });
}