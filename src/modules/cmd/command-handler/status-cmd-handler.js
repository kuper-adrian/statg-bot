var logger = require('../../log').getLogger();

exports.handle = function (cmd, bot, db, pubg) {
    
    var channelId = cmd.discordUser.channelId;

    pubg.status({
        success: function (data) {
            
            var data = data.data;

            var id = data.id;
            var releaseDate = data.attributes.releasedAt;
            var apiVersion = data.attributes.version;

            bot.sendMessage({
                to: channelId,
                message: 'ID: ' + id + ', Version: ' + apiVersion + ', Released At: ' + releaseDate
            });
        },
        error: function (err) {

            logger.warn(err);
            bot.sendMessage({
                to: channelId,
                message: 'Error on getting api status.'
            });
        }
    });
}