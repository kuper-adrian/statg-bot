const CommandHandler = require('./cmd-handler.js').CommandHandler;

class StatusCommandHandler extends CommandHandler {

    constructor() {
        super();
    }

    handle(cmd, bot, db, pubg) {

        let channelId = cmd.discordUser.channelId;

        return pubg.status()
            .then(data => {

                let statusData = data.data;

                let id = statusData.id;
                let releaseDate = statusData.attributes.releasedAt;
                let apiVersion = statusData.attributes.version;

                bot.sendMessage({
                    to: channelId,
                    message: 'ID: ' + id + ', Version: ' + apiVersion + ', Released At: ' + releaseDate
                });

                return Promise.resolve();
            })

            .catch(error => {

                this._onError(bot, channelId, error.message);
            })
    }
}

exports.getHandler = function() {
    return new StatusCommandHandler();
}