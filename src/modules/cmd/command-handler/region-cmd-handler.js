const { CommandHandler } = require('./cmd-handler.js');
const regionHelper = require('../region-helper');

const i18nCmdHandler = require('../../../i18n').getScope('commandHandler');
const i18nRegion = require('../../../i18n').getScope('region');


/**
 * Command handler for !statg region command. Sets global region
 * used by !statg register command.
 * @extends CommandHandler
 */
class RegionCommandHandler extends CommandHandler {
  handle(cmd, bot, db) {
    let newRegion = '';

    if (cmd.arguments.length === 1) {
      [newRegion] = cmd.arguments;

      if (!regionHelper.REGIONS.includes(newRegion)) {
        this.onError(bot, cmd, new Error(i18nRegion.t('unknownRegion', { region: newRegion })));
        return Promise.resolve();
      }

      return db.setGlobalRegion(newRegion)
        .then(() => {
          const message = i18nRegion.t('successMessage', { region: newRegion });
          this.onSuccess(bot, cmd, message);
          return Promise.resolve();
        })
        .catch((error) => {
          this.onError(bot, cmd, error);
          return Promise.resolve();
        });
    }
    this.onError(bot, cmd, new Error(i18nCmdHandler.t('invalidArguments')));
    return Promise.resolve();
  }
}

exports.getHandler = () => new RegionCommandHandler();
