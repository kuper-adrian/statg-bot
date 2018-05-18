const CommandHandler = require('./cmd-handler.js').CommandHandler;


/**
 * Useless example command that only anwers "pong!"
 */
class PingCommandHandler extends CommandHandler {

    constructor() {
        super();
    }

    handle(cmd, bot, db, pubg) {
        bot.sendMessage({
            to: cmd.discordUser.channelId,
            message: 'pong!'
        });
    }
}

exports.getHandler = function() {
    return new PingCommandHandler();
}