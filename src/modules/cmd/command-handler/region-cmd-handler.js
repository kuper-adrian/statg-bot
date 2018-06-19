const { CommandHandler } = require('./cmd-handler.js');
const { REGIONS } = require('./regions');

class RegionCommandHandler extends CommandHandler {
  setGlobalRegion(newRegion, cmd, db, bot) {
    return db.setGlobalRegion(newRegion)
      .then(() => {
        const message = `global region successfully set to "${newRegion}"!`;
        bot.sendMessage({
          message,
          to: cmd.discordUser.channelId,
        });
      })
      .catch((error) => {
        this.onError(bot, cmd.discordUser.channelId, error.message);
      });
  }

  handle(cmd, bot, db) {
    let newRegion = '';
    const { channelId } = cmd.discordUser;

    if (cmd.arguments.length === 0) {
      this.onError(bot, channelId, 'invalid amount of arguments');
      return Promise.resolve();
    } else if (cmd.arguments.length === 1) {
      [newRegion] = cmd.arguments;

      if (!REGIONS.includes(newRegion)) {
        this.onError(bot, channelId, `unknown region "${newRegion}"`);
        return Promise.resolve();
      }

      return this.setGlobalRegion(newRegion, cmd, db, bot);
    }

    this.onError(bot, channelId, 'invalid amount of arguments');
    return Promise.resolve();
  }
}

exports.getHandler = function getHandler() {
  return new RegionCommandHandler();
};
