const { CommandHandler } = require('./cmd-handler.js');

const HELP_LINK = 'https://github.com/kuper-adrian/statg-bot/blob/master/README.md#Commands';

/**
 * Handler for the "help" command
 * @extends CommandHandler
 */
class HelpCommandHandler extends CommandHandler {
  handle(cmd, bot) {
    if (cmd.arguments.length !== 0) {
      this.onError(bot, cmd, new Error('invalid amount of arguments'));
      return;
    }

    this.onSuccess(bot, cmd, `Click [here](${HELP_LINK}) to get help about all statg commands.`);
  }
}

exports.getHandler = function getHandler() {
  return new HelpCommandHandler();
};
