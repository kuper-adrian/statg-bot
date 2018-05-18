const CommandHandler = require('./cmd-handler.js').CommandHandler;

const REGIONS = [
    'pc-na',
    'pc-eu',
    'pc-ru',
    'pc-oc',
    'pc-kakao',
    'pc-sea',
    'pc-sa',
    'pc-as',
    'pc-jp',
    'pc-krjp',
    'xbox-as',
    'xbox-eu',
    'xbox-na',
    'xbox-oc'
]

class RegionCommandHandler extends CommandHandler {

    constructor() {
        super();
    }

    handle(cmd, bot, db, pubg) {

        let newRegion = '';
        let channelId = cmd.discordUser.channelId;

        if (cmd.arguments.length === 0) {
            this._onError(bot, channeldId, "No region passed as argument")
            return;
        } else if (cmd.arguments.length === 1) {

            newRegion = cmd.arguments[0];

            if (!REGIONS.includes(newRegion)) {
                this._onError(bot, channeldId, `Invalid region "${newRegion}"`)
                return;
            }

            db.knex()
                .select()
                .from(db.TABLES.region)
                .where({
                    region_name: newRegion
                })

                .then(rows => {

                    if (rows.length === 0) {
                        return Promise.reject("Unknown region.")
                    }

                    return db.knex(db.TABLES.region)
                        .update({
                            is_global_region: false
                        })
                        .where({
                            is_global_region: true
                        })
                })

                .then(o => {

                    return db.knex(db.TABLES.region)
                        .update({
                            is_global_region: true
                        })
                        .where({
                            region_name: argument
                        })
                })

                .then(o => {

                    let message = `Region successfully set to "${newRegion}"!`
                    bot.sendMessage({
                        to: cmd.discordUser.channelId,
                        message: message
                    });
                })

                .catch(error => {
                    this._onError(bot, channelId, error.message);
                });

        } else if (cmd.arguments.length === 2) {

            // TODO select region for specific player

        } else {
            this._onError(bot, channeldId, "Invalid amount of arguments")
            return;
        }
    }
}

exports.getHandler = function() {
    return new RegionCommandHandler();
}