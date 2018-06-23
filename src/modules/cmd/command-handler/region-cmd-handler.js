const { CommandHandler } = require('./cmd-handler.js');
const regionHelper = require('../region-helper');

class RegionCommandHandler extends CommandHandler {
  handle(cmd, bot, db) {
    let newRegion = '';

    if (cmd.arguments.length === 1) {
      [newRegion] = cmd.arguments;

      if (!regionHelper.REGIONS.includes(newRegion)) {
        this.onError(bot, cmd, new Error(`unknown region "${newRegion}"`));
        return Promise.resolve();
      }

      return db.setGlobalRegion(newRegion)
        .then(() => {
          const message = `global region successfully set to "${newRegion}"!`;
          this.onSuccess(bot, cmd, message);
          return Promise.resolve();
        })
        .catch((error) => {
          this.onError(bot, cmd, error);
          return Promise.resolve();
        });
    }
    this.onError(bot, cmd, new Error('invalid amount of arguments'));
    return Promise.resolve();
  }
}

exports.getHandler = () => new RegionCommandHandler();
