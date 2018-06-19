/**
 * Base class for command handler.
 */
class CommandHandler {
  constructor() {
    /* eslint global-require: "off" */
    this.logger = require('../../log.js').getLogger();
  }

  onError(bot, channelId, detailMessage) {
    const errorMessage = `Error on handling command. Details: ${detailMessage}`;

    this.logger.error(errorMessage);
    bot.sendMessage({
      to: channelId,
      message: errorMessage,
    });
  }
}

exports.CommandHandler = CommandHandler;
