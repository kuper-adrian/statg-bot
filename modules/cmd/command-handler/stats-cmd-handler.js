var logger = require('../../log').getLogger();

const AVAILABLE_ARGS = [
    "solo",
    "solo-fpp",
    "duo",
    "duo-fpp",
    "squad",
    "squad-fpp"
]

/**
 * Called when this command could not successfully executed.
 * 
 * @param {String} channelId Id of the channel
 * @param {String} detailMessage Details about why the command failed
 */
function onError(bot, channelId, detailMessage) {

    let errorMessage = 'Error on fetching stats. Details: ' + detailMessage;

    logger.warn(errorMessage)
    bot.sendMessage({
        to: channelId,
        message: errorMessage
    });
}

function getAverageStats(gameModeStats) {

    let result = {
        kills: 0,
        assists: 0,
        damageDealt: 0.0,
        wins: 0,
        winPoints: 0.0,
        roundsPlayed: 0
    };

    let gameModeCount = 0;
    for (let key in gameModeStats) {
        let gameMode = gameModeStats[key];

        result.kills += gameMode.kills;
        result.assists += gameMode.assists;
        result.damageDealt += gameMode.damageDealt;
        result.wins += gameMode.wins;
        result.winPoints += gameMode.winPoints;
        result.roundsPlayed += gameMode.roundsPlayed;

        gameModeCount++;
    }

    result.avgKills = result.kills / result.roundsPlayed;
    result.avgAssists = result.assists / result.roundsPlayed;
    result.avgDamageDealt = result.damageDealt / result.roundsPlayed;
    result.avgWins = result.wins / result.roundsPlayed;
    result.avgWinPoints = result.winPoints / gameModeCount;

    return result;
}

function round(number, precision) {
    var shift = function (number, precision) {
        var numArray = ("" + number).split("e");
        return +(numArray[0] + "e" + (numArray[1] ? (+numArray[1] + precision) : precision));
    };
    return shift(Math.round(shift(number, +precision)), -precision);
}

function getStatsAsDiscordFormattedString(pubgPlayerName, gameMode, avgStats) {

    let result =
`Season stats for player **${pubgPlayerName}** (game mode: **${gameMode}**):
\`\`\`markdown
- Kills:           ${avgStats.kills} (avg. ${round(avgStats.avgKills, 2)})
- Assists:         ${avgStats.assists} (avg. ${round(avgStats.avgAssists, 2)})
- Damage:          ${round(avgStats.damageDealt, 2)} (avg. ${round(avgStats.avgDamageDealt, 2)})
- Wins:            ${avgStats.wins} (avg. ${round(avgStats.avgWins, 4)})
- Rounds Played:   ${avgStats.roundsPlayed}
\`\`\``

    return result;
}

exports.handle = function (cmd, bot, db, pubg) {

    logger.info("Handling stats command!");

    let channelId = cmd.discordUser.channelId;
    let discordId = cmd.discordUser.id;
    let pubgId;
    let pubgPlayerName;

    logger.debug("checking if player is registered");

    db.knex.select()
        .from(db.TABLES.registeredPlayer)
        .where({
            discord_id: discordId
        })

        .then(rows => {

            if (rows.length === 0) {
                return Promise.reject('Player not registered. Try register command first');
            } else if (rows.length > 1) {
                return Promise.reject('Something really weird happened.');
            }

            pubgId = rows[0].pubg_id;
            pubgPlayerName = rows[0].pubg_name;
            return pubgId;
        })

        .then(pubgId => {
            return pubg.seasons();
        })

        .then(seasons => {

            logger.debug("Successfully fetched seasons data!");

            seasons = seasons.data;
            let currentSeason = seasons.filter(s => {
                return s.attributes.isCurrentSeason;
            })[0];

            logger.debug('Id of current season: ' + currentSeason.id);
            return currentSeason.id;
        })

        .then(seasonId => {

            logger.debug("Fetching stats...")
            return pubg.playerStats(pubgId, seasonId);
        })

        .then(stats => {

            logger.debug("Successfully fetched stats!");

            let avgStats;
            let message;

            if (cmd.arguments.length === 0) {

                avgStats = getAverageStats(stats.data.attributes.gameModeStats)
                message = getStatsAsDiscordFormattedString(pubgPlayerName, "all", avgStats);

            } else if (AVAILABLE_ARGS.includes(cmd.arguments[0])) {

                let gameMode = cmd.arguments[0];
                let filteredStats = {};

                filteredStats[gameMode] = stats.data.attributes.gameModeStats[gameMode];

                avgStats = getAverageStats(filteredStats)
                message = getStatsAsDiscordFormattedString(pubgPlayerName, gameMode, avgStats);


            } else if (cmd.arguments.length > 1) {

                onError(bot, channelId, `Invalid amount of arguments.`);
                return;

            } else {

                onError(bot, channelId, `Unknown argument: "${cmd.arguments[0]}"`);
                return;
            }

            bot.sendMessage({
                to: channelId,
                message: message
            });
        })

        .catch(err => {
            onError(bot, channelId, err);
        });
}