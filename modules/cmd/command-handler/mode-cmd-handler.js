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
    let selectedMode;

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

            selectedMode = rows[0];

            return knex(db.TABLES.settings)
                .update({
                    mode_id: selectedMode.id
                })
                .where({
                    id: 1
                });
        })

        .then(o => {

            bot.sendMessage({
                to: cmd.discordUser.channelId,
                message: `Bot mode successfully changed to "${selectedMode.mode_name}"!`
            });
        })

        .catch(error => {

            // TODO error
        })

    
}