const { CommandHandler } = require('./cmd-handler.js');

/**
 * Useless example command that only anwers "pong!"
 */
class PingCommandHandler extends CommandHandler {
  handle(cmd, bot) {
    this.logger.debug('sending answer');

    bot.sendMessage({
      to: cmd.discordUser.channelId,
      message: 'pong',
    });
  }
}

exports.getHandler = function getHandler() {
  return new PingCommandHandler();
};
