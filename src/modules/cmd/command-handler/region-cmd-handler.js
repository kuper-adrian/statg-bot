const { CommandHandler } = require('./cmd-handler.js');
const { REGIONS } = require('./regions');

class RegionCommandHandler extends CommandHandler {
  handle(cmd, bot, db) {
    let newRegion = '';
    const { channelId } = cmd.discordUser;

    if (cmd.arguments.length === 1) {
      [newRegion] = cmd.arguments;

      if (!REGIONS.includes(newRegion)) {
        this.onError(bot, channelId, `unknown region "${newRegion}"`);
        return Promise.resolve();
      }

      return db.setGlobalRegion(newRegion)
        .then(() => {
          const message = `global region successfully set to "${newRegion}"!`;
          bot.sendMessage({
            to: cmd.discordUser.channelId,
            message,
          });
          return Promise.resolve();
        })
        .catch((error) => {
          this.onError(bot, cmd.discordUser.channelId, error.message);
          return Promise.resolve();
        });
    }
    this.onError(bot, channelId, 'invalid amount of arguments');
    return Promise.resolve();
  }
}

exports.getHandler = () => new RegionCommandHandler();
