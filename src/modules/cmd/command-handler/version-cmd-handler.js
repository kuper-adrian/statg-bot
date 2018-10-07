const { CommandHandler } = require('./cmd-handler.js');

const { version } = require('../../../../package.json');
const { author } = require('../../../../package.json');

/**
 * Command handler for the !statg version command. Shows info about version
 * and author of the bot.
 * @extends CommandHandler
 */
class VersionCommandHandler extends CommandHandler {
  handle(cmd, bot) {
    if (cmd.arguments.length !== 0) {
      this.onError(bot, cmd, new Error('invalid amount of arguments'));
      return;
    }

    const fields = [
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
    ];
    this.onResolved(bot, cmd, fields, true);
  }
}

exports.getHandler = function getHandler() {
  return new VersionCommandHandler();
};
