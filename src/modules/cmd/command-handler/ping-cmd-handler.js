/**
 * Useless example command that only anwers "pong!"
 */

exports.handle = function (cmd, bot, db, pubg) {
    bot.sendMessage({
        to: cmd.discordUser.channelId,
        message: 'pong!'
    });
}