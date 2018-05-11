var logger = require('../../log').getLogger();

/**
 * Called when this command could not successfully executed.
 * 
 * @param {String} channelId Id of the channel
 * @param {String} detailMessage Details about why the command failed
 */
function onError(bot, channelId, detailMessage) {
    
    let errorMessage = 'Error on fetching stats. Details: ' + detailMessage;
    
    logger.warn(errorMessage)
    bot.sendMessage({
        to: channelId,
        message: errorMessage
    });
}

exports.handle = function (cmd, bot, db, pubg) {
    
    logger.info("Handling stats command!");

    let channelId = cmd.discordUser.channelId;
    let discordId = cmd.discordUser.id;
    let pubgId;

    logger.debug("checking if player is registered");

    db.knex(db.TABLES.registeredPlayer)
        .select('pubg_id')
        .where({
            discord_id: discordId
        })
        .then(rows => {

            if (rows.length === 0) {
                onError(bot, channelId, 'Player not registered. Try register command first');
                return;
            } else if (rows.length > 1) {
                logger.error("this should not happen.")
                return;
            }

            pubgId = rows[0];
        })
        .catch(err => {
            onError(bot, channelId, err);
        });

    // aktuelle Season von api holen
    // TODO: Wert cachen!

    // TODO mit then an datenbank zugriff packen
    
    logger.debug("Fetching seasons data...")
    pubg.seasons()
        .then(seasons => {

            logger.debug("Successfully fetched seasons data!");

            seasons = seasons.data;
            let currentSeason = seasons.filter(s => {
                return s.attributes.isCurrentSeason;
            });

            return currentSeason.id;
        })
        .then(seasonId => {

            logger.debug("Fetching stats...")
            pubg.playerStats(pubgId, seasonId);
        })
        .then(stats => {

            logger.debug("Successfully fetched stats!");

            bot.sendMessage({
                to: channelId,
                message: stats.toString()
            });
        })
        .catch(error => {

            onError(bot, channelId, error);
        });
}