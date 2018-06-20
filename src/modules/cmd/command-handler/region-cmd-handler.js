const CommandHandler = require('./cmd-handler.js').CommandHandler;
const REGIONS = require('./regions').REGIONS;

class RegionCommandHandler extends CommandHandler {

    constructor() {
        super();
    }

    handle(cmd, bot, db, pubg) {

        let newRegion = '';
        let channelId = cmd.discordUser.channelId;

        if (cmd.arguments.length === 1) {

            newRegion = cmd.arguments[0];

            if (!REGIONS.includes(newRegion)) {
                this._onError(bot, channelId, `unknown region "${newRegion}"`)
                return Promise.resolve();
            }

            return db.setGlobalRegion(newRegion)
                .then(() => {
                    let message = `global region successfully set to "${newRegion}"!`
                    bot.sendMessage({
                        to: cmd.discordUser.channelId,
                        message: message
                    });
                    return Promise.resolve();
                })
                .catch(error => {
                    this._onError(bot, cmd.discordUser.channelId, error.message);
                    return Promise.resolve();
                });

        } else {
            this._onError(bot, channelId, "invalid amount of arguments")
            return Promise.resolve();
        }
    }
}

exports.getHandler = function () {
    return new RegionCommandHandler();
}