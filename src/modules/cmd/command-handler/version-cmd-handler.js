const CommandHandler = require('./cmd-handler.js').CommandHandler;
const moment = require('moment');

const version = require('../../../../package.json').version;
const author = require('../../../../package.json').author;

/**
 * Command handler for the "version" command.
 * 
 * Shows info about version and author of the bot.
 */
class VersionCommandHandler extends CommandHandler {

    constructor() {
        super();
    }

    handle(cmd, bot, db, pubg) {
        bot.sendMessage({
            to: cmd.discordUser.channelId,
            message: `\`\`\`statg-bot v${version} by ${author}\`\`\``
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

exports.getHandler = function () {
    return new VersionCommandHandler();
}