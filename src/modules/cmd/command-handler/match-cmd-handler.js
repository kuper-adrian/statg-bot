const { CommandHandler } = require('./cmd-handler.js');
const math = require('../../math');

class MatchCommandHandler extends CommandHandler {
  /**
   * Handles the match command.
   * @param {*} cmd the command object
   * @param {*} bot the bot object
   * @param {*} db the db object
   * @param {*} pubg the pubg api object
   */
  handle(cmd, bot, db, pubg) {
    const { channelId } = cmd.discordUser;
    let playerPubgId = '';
    let regionName = '';

    if (cmd.arguments.length !== 0) {
      this.onError(bot, cmd, 'invalid amount of arguments');
      return Promise.resolve();
    }

    return db.getRegisteredPlayers({ discord_id: cmd.discordUser.id })

      .then((rows) => {
        if (rows.length === 0) {
          return Promise.reject(new Error('Player not registered. Try register command first'));
        } else if (rows.length > 1) {
          return Promise.reject(new Error('Something really weird happened.'));
        }

        const player = rows[0];
        playerPubgId = player.pubg_id;

        return db.getRegions({ id: player.region_id });
      })

      .then((rows) => {
        if (rows.length !== 1) {
          return Promise.reject(new Error('Something really weird happened.'));
        }

        regionName = rows[0].region_name;
        return pubg.playerById(playerPubgId, regionName);
      })

      .then((playerData) => {
        const playerInfo = playerData.data;
        const latestMatchInfo = playerInfo.relationships.matches.data[0];

        return pubg.matchById(latestMatchInfo.id, regionName);
      })

      .then((matchData) => {
        const players = matchData.included.filter(i => i.type === 'participant');
        const rosters = matchData.included.filter(i => i.type === 'roster');

        const requestingPlayer = players.filter(p =>
          p.attributes.stats.playerId === playerPubgId)[0];

        const requestingPlayerRoster = rosters.filter(r =>
          r.relationships.participants.data.map(p => p.id)
            .includes(requestingPlayer.id))[0];

        const teammateIds = requestingPlayerRoster.relationships.participants.data.map(d => d.id);

        const teammates = players.filter(p => teammateIds.includes(p.id));


        const message = MatchCommandHandler.craftDiscordMessage(matchData, teammates);
        bot.sendMessage({
          message,
          to: channelId,
        });

        if (teammates[0].attributes.stats.winPlace === 1) {
          bot.sendMessage({
            to: channelId,
            tts: true,
            message: 'WINNER WINNER CHICKEN DINNER!',
          });
        }
      })

      .catch((error) => {
        this.onError(bot, cmd, error.message);
      });
  }

  static getPlayerStatsString(player) {
    const { stats } = player.attributes;

    return ` 
**${stats.name}**
\`\`\`markdown
- Kills:      ${stats.kills} (${stats.headshotKills})
- Assists:    ${stats.assists}
- Damage:     ${math.round(stats.damageDealt, 2)}
- Heals:      ${stats.heals}
- Revives:    ${stats.revives}

- Win Points: ${stats.winPoints} (${stats.winPointsDelta})
\`\`\``;
  }

  static craftDiscordMessage(matchData, teammates) {
    const matchPlace = teammates[0].attributes.stats.winPlace;

    let result =
`**Latest Match Info**
\`\`\`markdown
- Game Mode: ${matchData.data.attributes.gameMode}
- Map Name:  ${matchData.data.attributes.mapName}
- Time:      ${matchData.data.attributes.createdAt}
- Duration:  ${math.round(matchData.data.attributes.duration / 60.0, 2)}min

- Win Place: ${matchPlace}
\`\`\`
`;

    // CHICKEN DINNER!!!
    if (matchPlace === 1) {
      result += `
\`\`\`
WINNER WINNER CHICKEN DINNER
\`\`\`
`;
    }

    teammates.forEach((t) => {
      result += MatchCommandHandler.getPlayerStatsString(t);
    });

    return result;
  }
}

exports.getHandler = function getHandler() {
  return new MatchCommandHandler();
};
