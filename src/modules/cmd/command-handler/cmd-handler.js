const i18n = require('../../../i18n').getScope('commandHandler');

/**
 * Base class for command handler.
 */
class CommandHandler {
  constructor() {
    /* eslint global-require: "off" */
    this.logger = require('../../log.js').getLogger();

    this.defaultEmbedColor = 1344221; // blue
    this.successEmbedColor = 1365331; // green
    this.errorEmbedColor = 14688331; // red
  }

  /**
   * Writes embed message with given fields to discord channel.
   * Used to display the result of an command that needs more than
   * a simple confirmation.
   * @param {Object} bot the discord.io bot object
   * @param {Object} cmd the command object
   * @param {Array} embedFields Array of fields that should be inserted into embed message
   */
  onResolved(bot, cmd, embedFields, directMessage = false) {
    this.logger.debug('onResolved');
    const data = CommandHandler.createEmbedData(
      cmd,
      this.defaultEmbedColor,
      embedFields,
      directMessage,
    );
    bot.sendMessage(data);
  }

  /**
   * Writes success embed message to discord channel.
   * Used to confirm an that a command was executed successfully.
   * @param {Object} bot the discord.io bot object
   * @param {Object} cmd the command object
   * @param {String} successMessage the success message
   */
  onSuccess(bot, cmd, successMessage) {
    const data = CommandHandler.createEmbedData(
      cmd,
      this.successEmbedColor,
      [
        {
          name: i18n.t('success'),
          value: successMessage,
        },
      ],
      true,
    );

    this.logger.debug(successMessage);
    bot.sendMessage(data);
  }

  /**
   * Writes error embed message to discord channel.
   * Used to indicate that an error occurred when executing the command.
   * @param {Object} bot the discord.io bot object
   * @param {Object} cmd the command object
   * @param {Error} error the error that occurred
   */
  onError(bot, cmd, error) {
    if (!(error instanceof Error)) {
      throw new Error('argument "error" must be of type "Error"');
    }

    const data = CommandHandler.createEmbedData(
      cmd,
      this.errorEmbedColor,
      [
        {
          name: i18n.t('error'),
          value: error.message,
        },
      ],
      true,
    );

    this.logger.error(error.message);
    bot.sendMessage(data);
  }

  /**
   * Creates message data for embed message.
   * @param {Object} cmd the command object
   * @param {Number} color Number of the color of the embed message
   * @param {Array} fields Array of fields in the embed message
   */
  static createEmbedData(cmd, color, fields, directMessage = false) {
    return {
      to: directMessage ? cmd.discordUser.id : cmd.discordUser.channelId,
      embed: {
        color,
        timestamp: (new Date()).toISOString(),
        footer: {
          icon_url: 'https://cdn.discordapp.com/embed/avatars/4.png',
          text: `!statg ${cmd.command}`,
        },
        fields,
      },
    };
  }
}

exports.CommandHandler = CommandHandler;
