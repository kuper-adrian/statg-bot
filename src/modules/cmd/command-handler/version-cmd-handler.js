/**
 * Command handler for the "version" command.
 * 
 * Shows info about version and author of the bot.
 */

const version = require('../../../../package.json').version;
const author = require('../../../../package.json').author;

exports.handle = function (cmd, bot, db, pubg) {
    bot.sendMessage({
        to: cmd.discordUser.channelId,
        message: `statg-bot v${version} by ${author}`
    });
}