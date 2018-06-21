const { CommandHandler } = require('./cmd-handler.js');


/**
 * Command for unregistering the pubg player name from the discord user.
 */
class UnregisterCommandHandler extends CommandHandler {
  handle(cmd, bot, db) {
    if (cmd.arguments.length !== 0) {
      this.onError(bot, cmd, 'invalid amount of arguments');
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
        const data = {
          to: cmd.discordUser.channelId,
          embed: {
            color: this.successEmbedColor,
            timestamp: this.moment().toISOString(),
            footer: {
              icon_url: 'https://cdn.discordapp.com/embed/avatars/4.png',
              text: `!statg ${cmd.command}`,
            },
            fields: [
              {
                name: 'Success',
                value: `Player "${player.pubg_name}" successfully unregistered!`,
              },
            ],
          },
        };

        bot.sendMessage(data);
      })

      .catch((error) => {
        this.onError(bot, cmd, error.message);
      });
  }
}

exports.getHandler = function getHandler() {
  return new UnregisterCommandHandler();
};
