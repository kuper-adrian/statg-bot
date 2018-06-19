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
      this.onError(bot, channelId, 'invalid amount of arguments');
      return;
    }

    bot.sendMessage({
      to: channelId,
      message: `\`\`\`statg-bot v${version} by ${author}\`\`\``,
    });

    // bot.sendMessage({
    //     to: cmd.discordUser.channelId,
    //     embed: {
    //         "color": 9101324,
    //         "timestamp": `${moment().toString()}`,
    //         "footer": {
    //             "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png",
    //             "text": `by ${author}`
    //         },
    //         "fields": [
    //             {
    //                 "name": "Version",
    //                 "value": `${version}`
    //             },
    //             {
    //                 "name": "Source",
    //                 "value": "[BitBucket](https://bitbucket.org/Blooby/stat-g/src/master/)"
    //             }
    //         ]
    //     }
    // })
  }
}

exports.getHandler = function getHandler() {
  return new VersionCommandHandler();
};
