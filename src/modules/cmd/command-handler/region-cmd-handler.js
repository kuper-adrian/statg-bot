const CommandHandler = require('./cmd-handler.js').CommandHandler;
const REGIONS = require('./regions').REGIONS;

class RegionCommandHandler extends CommandHandler {

    constructor() {
        super();
    }

    // _setRegionForUser(newRegion, cmd, db, bot) {
        
    //     return db.knex
    //         .select()
    //         .from(db.TABLES.region)
    //         .where('region_name', newRegion)

    //         .then((rows) => {
    //             const regionId = rows[0].region_id;

    //             return db.knex(db.TABLES.registeredPlayer)
    //                 .where('discord_id', cmd.discordUser.id)
    //                 .update({ region_id: regionId })
    //         })

    //         .then((o) => {
    //             let message = `region successfully set to "${newRegion}"!`
    //             bot.sendMessage({
    //                 to: cmd.discordUser.channelId,
    //                 message: message
    //             });
    //         })

    //         .catch((error) => {
    //             this._onError(bot, cmd.discordUser.channelId, error.message);
    //         })
    // }

    _setGlobalRegion(newRegion, cmd, db, bot) {

        // use transaction to prevent faulty database state (e.g. no global region)
        return db.knex.transaction((trx) => {

            // first set current global region off
            return db.knex(db.TABLES.region)
                .transacting(trx)
                .update({ is_global_region: false })
                .where({ is_global_region: true })

                .then(() => {
                    // ... set new global region
                    return db.knex(db.TABLES.region)
                        .transacting(trx)
                        .update({ is_global_region: true })
                        .where({ region_name: newRegion })
                })

                .then(trx.commit)
                .catch(trx.rollback)
        })
        .then(o => {
            let message = `global region successfully set to "${newRegion}"!`
            bot.sendMessage({
                to: cmd.discordUser.channelId,
                message: message
            });
        })
        .catch(error => {
            this._onError(bot, cmd.discordUser.channelId, error.message);
        }); 
    }

    handle(cmd, bot, db, pubg) {

        let newRegion = '';
        let channelId = cmd.discordUser.channelId;

        if (cmd.arguments.length === 0) {
            this._onError(bot, channelId, "invalid amount of arguments")
            return Promise.resolve();
        } else if (cmd.arguments.length === 1) {

            newRegion = cmd.arguments[0];

            if (!REGIONS.includes(newRegion)) {
                this._onError(bot, channelId, `unknown region "${newRegion}"`)
                return Promise.resolve();
            }

            return this._setGlobalRegion(newRegion, cmd, db, bot);

        } else {
            this._onError(bot, channelId, "invalid amount of arguments")
            return Promise.resolve();
        }
    }
}

exports.getHandler = function() {
    return new RegionCommandHandler();
}