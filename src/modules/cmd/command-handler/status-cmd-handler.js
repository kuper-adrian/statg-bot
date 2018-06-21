const { CommandHandler } = require('./cmd-handler.js');

class StatusCommandHandler extends CommandHandler {
  handle(cmd, bot, db, pubg) {
    const { channelId } = cmd.discordUser;

    if (cmd.arguments.length !== 0) {
      this.onError(bot, cmd, new Error('invalid amount of arguments'));
      return undefined;
    }

    return pubg.status()
      .then((data) => {
        const statusData = data.data;

        const { id } = statusData;
        const { version: apiVersion } = statusData.attributes;


        const botMessage = {
          to: channelId,
          embed: {
            title: 'PUBG-API online!',
            color: 1365331,
            timestamp: this.moment().toISOString(),
            footer: {
              icon_url: 'https://cdn.discordapp.com/embed/avatars/4.png',
              text: '!statg status',
            },
            fields: [
              {
                name: 'ID',
                value: id,
                inline: true,
              },
              {
                name: 'Version',
                value: apiVersion,
                inline: true,
              },
            ],
          },
        };
        bot.sendMessage(botMessage);
      })

      .catch((error) => {
        this.onError(bot, cmd, error);
      });
  }
}

exports.getHandler = function getHandler() {
  return new StatusCommandHandler();
};
