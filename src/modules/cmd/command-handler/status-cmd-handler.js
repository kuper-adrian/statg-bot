const CommandHandler = require('./cmd-handler.js').CommandHandler;

class StatusCommandHandler extends CommandHandler {

    constructor() {
        super();
    }

    handle(cmd, bot, db, pubg) {

        let channelId = cmd.discordUser.channelId;

        if (cmd.arguments.length !== 0) {
            this._onError(bot, channelId, "invalid amount of arguments");
            return;
        }

        return pubg.status()
            .then(data => {

                let statusData = data.data;

                let id = statusData.id;
                let releaseDate = statusData.attributes.releasedAt;
                let apiVersion = statusData.attributes.version;

                bot.sendMessage({
                    to: channelId,
                    message: _getStatusMessage(id, apiVersion, releaseDate)
                });

                return Promise.resolve();
            })

            .catch(error => {

                this._onError(bot, channelId, error.message);
            })
    }

    _getStatusMessage(id, version, releasedAt) {
        return `\`\`\`
PUBG-API online!

ID:          ${id}
Version:     ${version}
Released at: ${releasedAt}\`\`\``
    }
}

exports.getHandler = function() {
    return new StatusCommandHandler();
}