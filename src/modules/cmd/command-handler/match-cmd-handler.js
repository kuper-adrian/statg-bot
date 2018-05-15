var logger = require('../../log').getLogger();
var _ = require('lodash');

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

function getPlayerStatsString(player) {

    let stats = player.attributes.stats;
    return ` 
**${stats.name}**
\`\`\`markdown
- Kills:      ${stats.kills} (${stats.headshotKills})
- Assists:    ${stats.assists}
- Damage:     ${_round(stats.damageDealt, 2)}
- Heals:      ${stats.heals}
- Revives:    ${stats.revives}

- Win Points: ${stats.winPoints} (${stats.winPointsDelta})
\`\`\``;
}

function craftDiscordMessage(matchData, teammates) {
    
    let matchPlace = teammates[0].attributes.stats.winPlace;

    let result = 
`**Latest Match Info**
\`\`\`markdown
- Game Mode: ${matchData.data.attributes.gameMode}
- Map Name:  ${matchData.data.attributes.mapName}
- Time:      ${matchData.data.attributes.createdAt}
- Duration:  ${_.round(matchData.data.attributes.duration, 2)}min

- Win Place: ${matchPlace}
\`\`\`
`;

    // CHICKEN DINNER!!!
    if (matchPlace === 1) {
        result += `
\`\`\`
WINNER WINNER CHICKEN DINNER
\`\`\`
`
    }

    _.forEach(teammates, t => {
        result += getPlayerStatsString(t);
    })

    return result;
}

exports.handle = function (cmd, bot, db, pubg) {

    let channelId = cmd.discordUser.channelId;
    let playerPubgId = '';

    db.knex.select('pubg_id')
        .from(db.TABLES.registeredPlayer)
        .where({
            discord_id: cmd.discordUser.id
        })

        .then(rows => {

            if (rows.length === 0) {
                return Promise.reject('Player not registered. Try register command first');
            } else if (rows.length > 1) {
                return Promise.reject('Something really weird happened.');
            }

            playerPubgId = rows[0].pubg_id; 
            return pubg.playerById(playerPubgId);
        })

        .then(playerData => {

            let playerInfo = playerData.data;
            let latestMatchInfo = playerInfo.relationships.matches.data[0];

            return pubg.matchById(latestMatchInfo.id);
        })

        .then(matchData => {

            let players = matchData.included.filter(i => {
                return i.type === "participant";
            });
            let rosters = matchData.included.filter(i => {
                return i.type === "roster";
            });

            let requestingPlayer = players.filter(p => {
                return p.attributes.stats.playerId === playerPubgId;
            })[0];

            let requestingPlayerRoster = rosters.filter(r => {
                return r.relationships.participants.data.map(p => {
                    return p.id;
                }).includes(requestingPlayer.id);
            })[0];

            let teammateIds = requestingPlayerRoster.relationships.participants.data.map(d => {
                return d.id;
            });

            let teammates = players.filter(p => {
                return teammateIds.includes(p.id);
            })


            let message = craftDiscordMessage(matchData, teammates);
            bot.sendMessage({
                to: channelId,
                message: message
            });

            if (teammates[0].attributes.stats.winPlace === 1) {
                bot.sendMessage({
                    to: channelId,
                    tts: true,
                    message: "WINNER WINNER CHICKEN DINNER!"
                })
            }
        })

        .catch(error => {

            onError(bot, channelId, error);
        });
}