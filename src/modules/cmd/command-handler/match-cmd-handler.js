const CommandHandler = require('./cmd-handler.js').CommandHandler;

const _ = require('lodash');

class MatchCommandHandler extends CommandHandler {

    constructor() {
        super();
    }

    handle(cmd, bot, db, pubg) {

        let channelId = cmd.discordUser.channelId;
        let playerPubgId = '';
        let regionName = '';

        db.getRegisteredPlayers({ discord_id: cmd.discordUser.id })

            .then(rows => {

                if (rows.length === 0) {
                    return Promise.reject('Player not registered. Try register command first');
                } else if (rows.length > 1) {
                    return Promise.reject('Something really weird happened.');
                }

                let player = rows[0];
                playerPubgId = player.pubg_id; 

                return db.getRegions({ id: player.region_id })
            })

            .then(rows => {

                if (rows.length !== 1) {
                    return Promise.reject('Something really weird happened.');
                }

                regionName = rows[0].region_name;
                return pubg.playerById(playerPubgId, regionName);
            })

            .then(playerData => {

                let playerInfo = playerData.data;
                let latestMatchInfo = playerInfo.relationships.matches.data[0];

                return pubg.matchById(latestMatchInfo.id, regionName);
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


                let message = this._craftDiscordMessage(matchData, teammates);
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
                this._onError(bot, channelId, error);
            });
    }

    _getPlayerStatsString(player) {

        let stats = player.attributes.stats;
        return ` 
**${stats.name}**
\`\`\`markdown
- Kills:      ${stats.kills} (${stats.headshotKills})
- Assists:    ${stats.assists}
- Damage:     ${_.round(stats.damageDealt, 2)}
- Heals:      ${stats.heals}
- Revives:    ${stats.revives}

- Win Points: ${stats.winPoints} (${stats.winPointsDelta})
\`\`\``;

    }

    _craftDiscordMessage(matchData, teammates) {
    
        let matchPlace = teammates[0].attributes.stats.winPlace;
    
        let result = 
`**Latest Match Info**
\`\`\`markdown
- Game Mode: ${matchData.data.attributes.gameMode}
- Map Name:  ${matchData.data.attributes.mapName}
- Time:      ${matchData.data.attributes.createdAt}
- Duration:  ${_.round(matchData.data.attributes.duration / 60.0, 2)}min

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
            result += this._getPlayerStatsString(t);
        })
    
        return result;
    }
}

exports.getHandler = function() {
    return new MatchCommandHandler();
}