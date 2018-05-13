/**
 * Handler for the "mode" command.
 * 
 * The mode of the bot specifies whether a command has to be prepended by "!statg" (default mode)
 * or can be issued by typing "![command-name]" (immediate mode)
 */

var logger = require('../../log').getLogger();

exports.handle = function (cmd, bot, db, pubg) {

    if (cmd.arguments.length === 0) {
        // TODO errror
        return;
    } else if (cmd.argumens.length > 1) {
        // TODO error
        return;
    }

    let mode = cmd.arguments[0];

    db.knex
        .select()
        .from(db.TABLES.mode)
        .where({
            mode_name: mode
        })

        .then(rows => {

            if (rows.length === 0) {
                // TODO error
            }

            // TODO
        })

    bot.sendMessage({
        to: cmd.discordUser.channelId,
        message: 'TODO: display help'
    });
}