const { CommandHandler } = require('./cmd-handler.js');

const { version } = require('../../../../package.json');
const { author } = require('../../../../package.json');

/**
 * Command handler for the "version" command.
 *
 * Shows info about version and author of the bot.
 */
class VersionCommandHandler extends CommandHandler {
  handle(cmd, bot) {
    const { channelId } = cmd.discordUser;

    if (cmd.arguments.length !== 0) {
      this.onError(bot, cmd, new Error('invalid amount of arguments'));
      return;
    }

    const data = {
      to: channelId,
      embed: {
        color: 1344221,
        timestamp: this.moment().toISOString(),
        footer: {
          icon_url: 'https://cdn.discordapp.com/embed/avatars/4.png',
          text: '!statg version',
        },
        fields: [
          {
            name: 'Version',
            value: version,
            inline: true,
          },
          {
            name: 'Created By',
            value: `[${author}](https://github.com/kuper-adrian)`,
            inline: true,
          },
          {
            name: 'Source Code',
            value: 'See how I work on [GitHub](https://github.com/kuper-adrian/statg-bot).',
          },
        ],
      },
    };
    bot.sendMessage(data);
  }
}

exports.getHandler = function getHandler() {
  return new VersionCommandHandler();
};
