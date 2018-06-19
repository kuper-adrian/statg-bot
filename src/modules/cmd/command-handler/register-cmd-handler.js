const { CommandHandler } = require('./cmd-handler.js');
const { REGIONS } = require('./regions');

class RegisterCommandHandler extends CommandHandler {
  handle(cmd, bot, db, pubg) {
    const { channelId } = cmd.discordUser;

    let playerName = '';
    let pubgPlayerData = {};
    let regionId = '';
    let regionName = '';


    if (cmd.arguments.length === 1) {
      [playerName] = cmd.arguments;

      return db.getRegions({ is_global_region: true })

        .then((rows) => {
          if (rows.length !== 1) {
            return Promise.reject(new Error('Something really weird happened.'));
          }

          regionId = rows[0].id;
          regionName = rows[0].region_name;

          return pubg.playerByName(playerName, regionName);
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

          return Promise.reject(new Error('There already is a player name registered for your discord user. Try using unregister command first.'));
        })

        .then(() => {
          bot.sendMessage({
            to: channelId,
            message: `Player "${pubgPlayerData.attributes.name}" successfully registered for region "${regionName}"!`,
          });
        })

        .catch((error) => {
          let errorInfo = '';

          if (error.apiErrors !== undefined &&
              error.apiErrors !== null &&
              error.apiErrors.length > 0) {
            errorInfo = error.apiErrors[0].detail;
          } else {
            errorInfo = error.message;
          }
          this.onError(bot, channelId, `Error on registering player "${playerName}" for region "${regionName}". ${errorInfo}`);
        });
    } else if (cmd.arguments.length === 2) {
      // check whether the second argument is a valid region
      if (!REGIONS.includes(cmd.arguments[1])) {
        this.onError(bot, channelId, `unknown region "${cmd.arguments[1]}"`);
        return Promise.resolve();
      }

      [playerName, regionName] = cmd.arguments;

      return db.getRegions({ region_name: regionName })

        .then((rows) => {
          if (rows.length !== 1) {
            return Promise.reject(new Error('Something really weird happened.'));
          }

          regionId = rows[0].id;

          return pubg.playerByName(playerName, regionName);
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
          return Promise.reject(new Error('There already is a player name registered for your discord user. Try using unregister command first.'));
        })

        .then(() => {
          bot.sendMessage({
            to: channelId,
            message: `Player "${pubgPlayerData.attributes.name}" successfully registered for region "${regionName}"!`,
          });
        })

        .catch((error) => {
          let errorInfo = '';

          if (error.apiErrors !== undefined &&
              error.apiErrors !== null &&
              error.apiErrors.length > 0) {
            errorInfo = error.apiErrors[0].detail;
          } else {
            errorInfo = error.message;
          }
          this.onError(bot, channelId, `Error on registering player "${playerName}" for region "${regionName}". ${errorInfo}`);
        });
    }
    this.onError(bot, channelId, 'invalid amount of arguments');
    return Promise.resolve();
  }
}

exports.getHandler = function getHandler() {
  return new RegisterCommandHandler();
};
