const { CommandHandler } = require('./cmd-handler.js');
const i18nCmdHandler = require('../../../i18n').getScope('commandHandler');
const i18nHelp = require('../../../i18n').getScope('help');

const HELP_LINK = 'https://github.com/kuper-adrian/statg-bot/blob/master/README.md#Commands';

/**
 * Handler for the "help" command
 * @extends CommandHandler
 */
class HelpCommandHandler extends CommandHandler {
  handle(cmd, bot) {
    if (cmd.arguments.length !== 0) {
      this.onError(bot, cmd, new Error(i18nCmdHandler.t('invalidArguments')));
      return;
    }

    this.onSuccess(bot, cmd, i18nHelp.t('helpMessage', { HELP_LINK }));
  }
}

exports.getHandler = function getHandler() {
  return new HelpCommandHandler();
};
