const { CommandHandler } = require('./cmd-handler.js');

const HELP_MESSAGE = 'https://github.com/kuper-adrian/statg-bot/blob/master/README.md';

/**
 * Handler for the "help" command
 */
class HelpCommandHandler extends CommandHandler {
  handle(cmd, bot) {
    const { channelId } = cmd.discordUser;

    if (cmd.arguments.length !== 0) {
      this.onError(bot, cmd, new Error('invalid amount of arguments'));
      return;
    }

    bot.sendMessage({
      to: channelId,
      message: HELP_MESSAGE,
    });
  }
}

exports.getHandler = function getHandler() {
  return new HelpCommandHandler();
};
