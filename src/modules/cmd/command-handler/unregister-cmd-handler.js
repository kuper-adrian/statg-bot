const CommandHandler = require('./cmd-handler.js').CommandHandler;


/**
 * Command for unregistering the pubg player name from the discord user.
 */
class UnregisterCommandHandler extends CommandHandler {

    constructor() {
        super();
    }

    handle(cmd, bot, db, pubg) {

        if (cmd.arguments.length !== 0) {
            this._onError(bot, cmd.discordUser.channelId, "invalid amount of arguments");
            return Promise.resolve();
        }

        let player = {};

        return db.getRegisteredPlayers({ discord_id: cmd.discordUser.id })
            
            .then((rows) => {

                if (rows.length === 0) {
                    return Promise.reject(new Error("player not registered"));
                }

                player = rows[0];

                return db.deleteRegisteredPlayers({ discord_id: cmd.discordUser.id })
            })

            .then((i) => {
                bot.sendMessage({
                    to: cmd.discordUser.channelId,
                    message: `Player "${player.pubg_name}" successfully unregistered!`
                });
            })

            .catch((error) => {
                this._onError(bot, cmd.discordUser.channelId, error.message);
            })
    }
}

exports.getHandler = function() {
    return new UnregisterCommandHandler();
}