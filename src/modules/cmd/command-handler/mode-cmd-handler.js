const CommandHandler = require('./cmd-handler.js').CommandHandler;

/**
 * Handler for the "mode" command.
 * 
 * The mode of the bot specifies whether a command has to be prepended by "!statg" (default mode)
 * or can be issued by typing "![command-name]" (immediate mode)
 */
class ModeCommandHandler extends CommandHandler {

    constructor() {
        super();
    }

    handle(cmd, bot, db, pubg) {

        let channelId = cmd.discordUser.channelId;

        if (cmd.arguments.length === 0) {
            this._onError(bot, channelId, "No arguments passed");
            return;
        } else if (cmd.argumens.length > 1) {
            this._onError(bot, channelId, "This command only accepts a single command");
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
                    return Promise.reject(`Mode "${mode}" not found`);
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
                this._onError(bot, channelId, error);
            })
    }
}

exports.getHandler = function() {
    return new ModeCommandHandler();
}