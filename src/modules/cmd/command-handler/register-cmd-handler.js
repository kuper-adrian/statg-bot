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
    let pubgPlayerData;

    pubg.playerByName(playerName)
        .then(data => {

            pubgPlayerData = data.data[0];

            return db.knex
                .select()
                .from(db.TABLES.registeredPlayer)
                .where('discord_id', cmd.discordUser.id)
        })

        .then(rows => {

            logger.info('adasd')

            if (rows.length === 0) {

                logger.debug("Adding new player...")

                return db.knex(db.TABLES.registeredPlayer)
                    .insert({
                        discord_id: cmd.discordUser.id,
                        discord_name: cmd.discordUser.name,
                        pubg_id: pubgPlayerData.id,
                        pubg_name: pubgPlayerData.attributes.name
                });

            } else {

                logger.debug("Updating player...")

                return db.knex(db.TABLES.registeredPlayer)
                    .where({
                        discord_id: cmd.discordUser.id
                    })
                    .update({
                        discord_name: cmd.disordUser.name,
                        pubg_id: pubgPlayerData.id,
                        pubg_name: pubgPlayerData.attributes.name
                    });
            }
        })

        .then(o => {

            bot.sendMessage({
                to: channelId,
                message: `Player "${pubgPlayerData.attributes.name}" successfully registered!"`
            });
        })

        .catch(error => {

            logger.error(error);

            let errorInfo;

            if (error.apiErrors !== undefined && error.apiErrors !== null && error.apiErrors.length > 0) {
                
                errorInfo = error.apiErrors[0].detail;                         
            } else {

                errorInfo = error.message;
            }

            bot.sendMessage({
                to: channelId,
                message: 'Error on registering player \"' + playerName + '\"! ' + errorInfo
            });
        })
}