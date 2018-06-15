const CommandHandler = require('./cmd-handler.js').CommandHandler;

const HELP_MESSAGE = `https://github.com/kuper-adrian/statg-bot/blob/master/README.md`

/**
 * Handler for the "help" command
 */
class HelpCommandHandler extends CommandHandler {

    constructor() {
        super();
    }

    handle(cmd, bot, db, pubg) {

        const channelId = cmd.discordUser.channelId; 

        if (cmd.arguments.length !== 0) {
            this._onError(bot, channelId, "invalid amount of arguments");
            return;
        }

        bot.sendMessage({
            to: channelId,
            message: HELP_MESSAGE
        });
    }
}

exports.getHandler = function() {
    return new HelpCommandHandler();
}