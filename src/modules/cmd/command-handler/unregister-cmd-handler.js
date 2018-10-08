const { CommandHandler } = require('./cmd-handler.js');

const i18nCmdHandler = require('../../../i18n').getScope('commandHandler');
const i18nUnregister = require('../../../i18n').getScope('unregister');

/**
 * Command for unregistering the pubg player name from the discord user.
 * @extends CommandHandler
 */
class UnregisterCommandHandler extends CommandHandler {
  handle(cmd, bot, db) {
    if (cmd.arguments.length !== 0) {
      this.onError(bot, cmd, new Error(i18nCmdHandler.t('invalidArguments')));
      return Promise.resolve();
    }

    let player = {};

    return db.getRegisteredPlayers({ discord_id: cmd.discordUser.id })

      .then((rows) => {
        if (rows.length === 0) {
          return Promise.reject(new Error(i18nUnregister.t('playerNotRegistered')));
        }

        [player] = rows;

        return db.deleteRegisteredPlayers({ discord_id: cmd.discordUser.id });
      })

      .then(() => {
        this.onSuccess(bot, cmd, i18nUnregister.t('successMessage', { PLAYER_NAME: player.pubg_name }));
      })

      .catch((error) => {
        this.onError(bot, cmd, error);
      });
  }
}

exports.getHandler = function getHandler() {
  return new UnregisterCommandHandler();
};
