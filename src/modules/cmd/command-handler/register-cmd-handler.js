const { CommandHandler } = require('./cmd-handler.js');
const regionHelper = require('../region-helper');

const i18nCmdHandler = require('../../../i18n').getScope('commandHandler');
const i18nRegister = require('../../../i18n').getScope('register');


/**
 * Command handler for !statg register command. Links discord account
 * with PUBG name and region to enable fetching stats from the
 * PUBG API.
 * @extends CommandHandler
 */
class RegisterCommandHandler extends CommandHandler {
  handle(cmd, bot, db, pubg) {
    let playerName = '';
    let pubgPlayerData = {};
    let regionId = '';
    let regionName = '';

    if (cmd.arguments.length === 1) {
      [playerName] = cmd.arguments;

      return db.getRegions({ is_global_region: true })

        .then((rows) => {
          if (rows.length !== 1) {
            return Promise.reject(new Error(i18nCmdHandler.t('unforseenError')));
          }

          regionId = rows[0].id;
          regionName = rows[0].region_name;

          return pubg.player({
            name: playerName,
            region: regionName,
          });
        })

        .then((data) => {
          [pubgPlayerData] = data.data;
          return db.getRegisteredPlayers({ discord_id: cmd.discordUser.id });
        })

        .then((rows) => {
          if (rows.length === 0) {
            this.logger.debug('Adding new player...');

            return db.insertRegisteredPlayer({
              discord_id: cmd.discordUser.id,
              discord_name: cmd.discordUser.name,
              pubg_id: pubgPlayerData.id,
              pubg_name: pubgPlayerData.attributes.name,
              region_id: regionId,
            });
          }

          return Promise.reject(new Error(i18nRegister.t('playerExists')));
        })

        .then(() => {
          this.onSuccess(
            bot,
            cmd,
            i18nRegister.t(
              'successMessage',
              {
                PLAYER_NAME: pubgPlayerData.attributes.name,
                REGION_NAME: regionName,
              },
            ),
          );
        })

        .catch((error) => {
          this.onError(bot, cmd, error);
        });
    } else if (cmd.arguments.length === 2) {
      // check whether the second argument is a valid region
      if (!regionHelper.REGIONS.includes(cmd.arguments[1])) {
        this.onError(bot, cmd, new Error(i18nRegister.t('unknownRegion', { REGION: cmd.arguments[1] })));
        return Promise.resolve();
      }

      [playerName, regionName] = cmd.arguments;

      return db.getRegions({ region_name: regionName })

        .then((rows) => {
          if (rows.length !== 1) {
            return Promise.reject(new Error(i18nCmdHandler.t('unforseenError')));
          }

          regionId = rows[0].id;

          return pubg.player({
            name: playerName,
            region: regionName,
          });
        })

        .then((data) => {
          [pubgPlayerData] = data.data;
          return db.getRegisteredPlayers({ discord_id: cmd.discordUser.id });
        })

        .then((rows) => {
          if (rows.length === 0) {
            this.logger.debug('Adding new player...');
            return db.insertRegisteredPlayer({
              discord_id: cmd.discordUser.id,
              discord_name: cmd.discordUser.name,
              pubg_id: pubgPlayerData.id,
              pubg_name: pubgPlayerData.attributes.name,
              region_id: regionId,
            });
          }
          return Promise.reject(new Error(i18nRegister.t('playerExists')));
        })

        .then(() => {
          this.onSuccess(
            bot,
            cmd,
            i18nRegister.t(
              'successMessage',
              {
                PLAYER_NAME: pubgPlayerData.attributes.name,
                REGION_NAME: regionName,
              },
            ),
          );
        })

        .catch((error) => {
          this.onError(bot, cmd, error);
        });
    }
    this.onError(bot, cmd, new Error(i18nCmdHandler.t('invalidArguments')));
    return Promise.resolve();
  }
}

exports.getHandler = function getHandler() {
  return new RegisterCommandHandler();
};
