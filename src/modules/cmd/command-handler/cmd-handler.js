const Command = require('../command.js').Command

/**
 * Base class for command handler.
 */
class CommandHandler {


    constructor() {
        this.logger = require('../../log.js').getLogger();
    }

    /**
     * 
     * @param {Command} cmd 
     * @param {*} bot 
     * @param {*} db 
     * @param {*} pubg 
     */
    handle(cmd, bot, db, pubg) {
        
    }

    _onError(bot, channelId, detailMessage) {

        let errorMessage = 'Error on fetching stats. Details: ' + detailMessage;

        this.logger.warn(errorMessage)
        bot.sendMessage({
            to: channelId,
            message: errorMessage
        });
    }
}

exports.CommandHandler = CommandHandler;