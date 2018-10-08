const { CommandHandler } = require('./cmd-handler.js');

const { version } = require('../../../../package.json');
const { author } = require('../../../../package.json');

const i18nCmdHandler = require('../../../i18n').getScope('commandHandler');
const i18nVersion = require('../../../i18n').getScope('version');

/**
 * Command handler for the !statg version command. Shows info about version
 * and author of the bot.
 * @extends CommandHandler
 */
class VersionCommandHandler extends CommandHandler {
  handle(cmd, bot) {
    if (cmd.arguments.length !== 0) {
      this.onError(bot, cmd, new Error(i18nCmdHandler.t('invalidArguments')));
      return;
    }

    const fields = [
      {
        name: i18nVersion.t('version'),
        value: version,
        inline: true,
      },
      {
        name: i18nVersion.t('createdBy'),
        value: `[${author}](https://github.com/kuper-adrian)`,
        inline: true,
      },
      {
        name: i18nVersion.t('sourceCode'),
        value: i18nVersion.t('sourceCodeMessage', { LINK: 'https://github.com/kuper-adrian/statg-bot' }),
      },
    ];
    this.onResolved(bot, cmd, fields, true);
  }
}

exports.getHandler = function getHandler() {
  return new VersionCommandHandler();
};
