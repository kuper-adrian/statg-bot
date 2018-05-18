const CommandHandler = require('./cmd-handler.js').CommandHandler;

class HelpCommandHandler extends CommandHandler {

    constructor() {
        super();
    }

    handle(cmd, bot, db, pubg) {

        bot.sendMessage({
            to: cmd.discordUser.channelId,
            message: 'TODO: display help'
        });
    }
}

exports.getHandler = function() {
    return new HelpCommandHandler();
}