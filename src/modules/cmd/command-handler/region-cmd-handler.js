var logger = require('../../log').getLogger();

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

exports.handle = function (cmd, bot, db, pubg) {

    let newRegion = '';

    if (cmd.arguments.length === 0) {
        // TODO error
        return;
    } else if (cmd.arguments.length === 1) {

        newRegion = cmd.arguments[0];

        if (!REGIONS.includes(newRegion)) {
            // TODO error
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
                // TODO error
            });

    } else if (cmd.arguments.length === 2) {

        // TODO select region for specific player

    } else {
        // TODO error
        return;
    }
}