/**
 * Base class for command handler.
 */
class CommandHandler {
  constructor() {
    /* eslint global-require: "off" */
    this.logger = require('../../log.js').getLogger();
    this.moment = require('moment');

    this.defaultEmbedColor = 1344221; // blue
    this.successEmbedColor = 1365331; // green
    this.errorEmbedColor = 14688331; // red
  }

  onError(bot, cmd, detailMessage) {
    const data = {
      to: cmd.discordUser.channelId,
      embed: {
        color: this.errorEmbedColor,
        timestamp: this.moment().toISOString(),
        footer: {
          icon_url: 'https://cdn.discordapp.com/embed/avatars/4.png',
          text: `!statg ${cmd.command}`,
        },
        fields: [
          {
            name: 'Error',
            value: detailMessage,
          },
        ],
      },
    };

    this.logger.error(detailMessage);
    bot.sendMessage(data);
  }
}

exports.CommandHandler = CommandHandler;
