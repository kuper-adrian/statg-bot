const CommandHandler = require('./cmd-handler.js').CommandHandler;
const REGIONS = require('./regions').REGIONS;

class RegionCommandHandler extends CommandHandler {

    constructor() {
        super();
    }

    _setGlobalRegion(newRegion, cmd, db, bot) {

        return db.setGlobalRegion(newRegion)
            .then(o => {
                let message = `global region successfully set to "${newRegion}"!`
                bot.sendMessage({
                    to: cmd.discordUser.channelId,
                    message: message
                });
            })
            .catch(error => {
                this._onError(bot, cmd.discordUser.channelId, error.message);
            }); 
    }

    handle(cmd, bot, db, pubg) {

        let newRegion = '';
        let channelId = cmd.discordUser.channelId;

        if (cmd.arguments.length === 0) {
            this._onError(bot, channelId, "invalid amount of arguments")
            return Promise.resolve();
        } else if (cmd.arguments.length === 1) {

            newRegion = cmd.arguments[0];

            if (!REGIONS.includes(newRegion)) {
                this._onError(bot, channelId, `unknown region "${newRegion}"`)
                return Promise.resolve();
            }

            return this._setGlobalRegion(newRegion, cmd, db, bot);

        } else {
            this._onError(bot, channelId, "invalid amount of arguments")
            return Promise.resolve();
        }
    }
}

exports.getHandler = function() {
    return new RegionCommandHandler();
}