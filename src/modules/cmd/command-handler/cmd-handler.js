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

  /**
   * Writes embed message with given fields to discord channel.
   * Used to display the result of an command that needs more than
   * a simple confirmation.
   * @param {Object} bot the discord.io bot object
   * @param {Object} cmd the command object
   * @param {Array} embedFields Array of fields that should be inserted into embed message
   */
  onResolved(bot, cmd, embedFields) {
    const data = this.createEmbedData(
      cmd,
      this.defaultEmbedColor,
      embedFields,
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
    const data = this.createEmbedData(
      cmd,
      this.successEmbedColor,
      [
        {
          name: 'Success',
          value: successMessage,
        },
      ],
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

    const data = this.createEmbedData(
      cmd,
      this.errorEmbedColor,
      [
        {
          name: 'Error',
          value: error.message,
        },
      ],
    );

    this.logger.error(error);
    bot.sendMessage(data);
  }

  /**
   * Creates message data for embed message.
   * @param {Object} cmd the command object
   * @param {Number} color Number of the color of the embed message
   * @param {Array} fields Array of fields in the embed message
   */
  createEmbedData(cmd, color, fields) {
    return {
      to: cmd.discordUser.channelId,
      embed: {
        color,
        timestamp: this.moment().toISOString(),
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
