let logger = require('../../log').getLogger();

exports.handle = function (cmd, bot, db, pubg) {

    let channelId = cmd.discordUser.channelId;

    if (cmd.arguments.length !== 1) {

        bot.sendMessage({
            to: channelId,
            message: 'This command only accepts a single argument.'
        });
        return;
    }

    let playerName = cmd.arguments[0];

    pubg.playerByName({
        name: playerName,
        success: function (data) {

            let pubgPlayerData = data.data[0];

            db.knex.select()
                .from(db.TABLES.registeredPlayer)
                .where('discord_id', cmd.discordUser.id)
                .then(players => {

                    console.log(players)
                    console.log(db.TABLES.registeredPlayer)

                    if (players.length == 0) {

                        logger.debug("Adding player...")

                        return db.knex(db.TABLES.registeredPlayer).insert({
                            discord_id: cmd.discordUser.id,
                            discord_name: cmd.discordUser.name,
                            pubg_id: pubgPlayerData.id,
                            pubg_name: pubgPlayerData.attributes.name
                        });
                    } else {

                        logger.debug("Updating player...")

                        return db.knex(db.TABLES.registeredPlayer)
                            .where('discord_id', cmd.discordUser.id)
                            .update({
                                discord_name: cmd.disordUser.name,
                                pubg_id: pubgPlayerData.id,
                                pubg_name: pubgPlayerData.attributes.name
                            });
                    }
                })
                .then(players => {
        
                    bot.sendMessage({
                        to: channelId,
                        message: 'Player \"' + playerName + '\" registered! Try the "stats" next.'
                    });
                })
                .catch(error => {

                    bot.sendMessage({
                        to: channelId,
                        message: 'Error on registering player \"' + playerName + '\" ' + error.toString()
                    });
                }); 
        },
        error: function (err) {
            logger.warn(err);
            
            if (err.apiErrors !== undefined && err.apiErrors !== null && err.apiErrors.length > 0) {
                
                let errorInfo = err.apiErrors[0].detail;           
                bot.sendMessage({
                    to: channelId,
                    message: 'Error on registering player \"' + playerName + '\"! ' + errorInfo
                });
            } else {
                bot.sendMessage({
                    to: channelId,
                    message: 'Error on registering player \"' + playerName + '\"'
                });
            }
        }
    });
}