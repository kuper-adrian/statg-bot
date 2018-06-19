const { CommandHandler } = require('./cmd-handler.js');


/**
 * Command for unregistering the pubg player name from the discord user.
 */
class UnregisterCommandHandler extends CommandHandler {
  handle(cmd, bot, db) {
    if (cmd.arguments.length !== 0) {
      this.onError(bot, cmd.discordUser.channelId, 'invalid amount of arguments');
      return Promise.resolve();
    }

    let player = {};

    return db.getRegisteredPlayers({ discord_id: cmd.discordUser.id })

      .then((rows) => {
        if (rows.length === 0) {
          return Promise.reject(new Error('player not registered'));
        }

        [player] = rows;

        return db.deleteRegisteredPlayers({ discord_id: cmd.discordUser.id });
      })

      .then(() => {
        bot.sendMessage({
          to: cmd.discordUser.channelId,
          message: `Player "${player.pubg_name}" successfully unregistered!`,
        });
      })

      .catch((error) => {
        this.onError(bot, cmd.discordUser.channelId, error.message);
      });
  }
}

exports.getHandler = function getHandler() {
  return new UnregisterCommandHandler();
};
