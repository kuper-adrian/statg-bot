var logger = require('../../log').getLogger();
var version = require('../../../package.json').version;

exports.handle = function (cmd, bot, db, pubg) {
    bot.sendMessage({
        to: cmd.discordUser.channelId,
        message: 'v' + version
    });
}