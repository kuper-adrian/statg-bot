const CommandHandler = require('./cmd-handler.js').CommandHandler;

class StatusCommandHandler extends CommandHandler {

    constructor() {
        super();
    }

    handle(cmd, bot, db, pubg) {

        let channelId = cmd.discordUser.channelId;

        pubg.status()
            .then(data => {

                let data = data.data;

                let id = data.id;
                let releaseDate = data.attributes.releasedAt;
                let apiVersion = data.attributes.version;

                bot.sendMessage({
                    to: channelId,
                    message: 'ID: ' + id + ', Version: ' + apiVersion + ', Released At: ' + releaseDate
                });
            })

            .catch(error => {

                this._onError(bot, channelId, error.message);
            })
    }
}

exports.getHandler = function() {
    return new StatusCommandHandler();
}