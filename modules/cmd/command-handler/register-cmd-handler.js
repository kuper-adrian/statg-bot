var logger = require('../../log').getLogger();

exports.handle = function (cmd, bot, db, pubg) {

    var channelId = cmd.discordUser.channelId;

    if (cmd.arguments.length !== 1) {

        bot.sendMessage({
            to: channelId,
            message: 'This command only accepts a single argument.'
        });
        return;
    }

    var playerName = cmd.arguments[0];

    pubg.playerByName({
        name: playerName,
        success: function (data) {

            var pubgPlayerData = data.data[0];

            var create = true;
            db.registered_player.read("discord_name = '" + cmd.discordUser.name + "'", (err, rows) => {
                if (err) {
                    bot.sendMessage({
                        to: channelId,
                        message: 'Error on registering player \"' + playerName + '\"'
                    });
                    create = false;
                }
                
                if (rows.length > 0) {
                    bot.sendMessage({
                        to: channelId,
                        message: 'Error on registering player \"' + playerName + '\". There is already a pubg name registered for your discord account.'
                    });
                    create = false;
                } else {

                    db.registered_player.create(
                        cmd.discordUser.id, 
                        cmd.discordUser.name, 
                        pubgPlayerData.id, 
                        pubgPlayerData.attributes.name);
        
                    bot.sendMessage({
                        to: channelId,
                        message: 'Player \"' + playerName + '\" registered!'
                    });
                }
            });
        },
        error: function (err) {
            logger.warn(err);
            
            if (err.apiErrors !== undefined && err.apiErrors !== null && err.apiErrors.length > 0) {
                
                var errorInfo = err.apiErrors[0].detail;           
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