const { CommandHandler } = require('./cmd-handler.js');

const i18nCmdHandler = require('../../../i18n').getScope('commandHandler');
const i18nStatus = require('../../../i18n').getScope('status');

/**
 * Command handler for !statg status command. Posts status of PUBG API.
 * @extends CommandHandler
 */
class StatusCommandHandler extends CommandHandler {
  handle(cmd, bot, db, pubg) {
    if (cmd.arguments.length !== 0) {
      this.onError(bot, cmd, new Error(i18nCmdHandler.t('invalidArguments')));
      return undefined;
    }

    return pubg.status()
      .then(() => {
        this.onSuccess(bot, cmd, i18nStatus.t('successMessage'));
      })

      .catch((error) => {
        this.onError(bot, cmd, error);
      });
  }
}

exports.getHandler = function getHandler() {
  return new StatusCommandHandler();
};
