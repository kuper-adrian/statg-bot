const CommandHandler = require('./cmd-handler.js').CommandHandler;

const version = require('../../../../package.json').version;
const author = require('../../../../package.json').author;

/**
 * Command handler for the "version" command.
 * 
 * Shows info about version and author of the bot.
 */
class VersionCommandHandler extends CommandHandler {

    constructor() {
        super();
    }

    handle(cmd, bot, db, pubg) {
        bot.sendMessage({
            to: cmd.discordUser.channelId,
            message: `statg-bot v${version} by ${author}`
        });
    }
}

exports.getHandler = function() {
    return new VersionCommandHandler();
}