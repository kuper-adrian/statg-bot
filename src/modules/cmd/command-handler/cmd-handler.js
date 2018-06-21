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

  onSuccess(bot, cmd, successMessage) {
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
            value: successMessage,
          },
        ],
      },
    };

    this.logger.debug(successMessage);
    bot.sendMessage(data);
  }

  onError(bot, cmd, error) {
    if (!(error instanceof Error)) {
      throw new Error('argument "error" must be of type "Error"');
    }

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
            value: error.message,
          },
        ],
      },
    };

    this.logger.error(error);
    bot.sendMessage(data);
  }
}

exports.CommandHandler = CommandHandler;
