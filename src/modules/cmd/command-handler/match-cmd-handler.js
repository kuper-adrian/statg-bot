const { CommandHandler } = require('./cmd-handler.js');
const math = require('../../math');
const regionHelper = require('../region-helper');
const pubgOpHelper = require('../pubg-op-helper');

/**
 * Handler for !statg match command. Posts statistics about latest match.
 * @extends CommandHandler
 */
class MatchCommandHandler extends CommandHandler {
  /**
   * Handles the match command.
   * @param {*} cmd the command object
   * @param {*} bot the bot object
   * @param {*} db the db object
   * @param {*} pubg the pubg api object
   */
  handle(cmd, bot, db, pubg) {
    let playerPubgId = '';
    let regionName = '';

    if (cmd.arguments.length !== 0) {
      this.onError(bot, cmd, new Error('invalid amount of arguments'));
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
        return pubg.player({
          id: playerPubgId,
          region: regionName,
        });
      })

      .then((playerData) => {
        const playerInfo = playerData.data;
        const latestMatchInfo = playerInfo.relationships.matches.data[0];

        return pubg.match({
          id: latestMatchInfo.id,
          region: regionName,
        });
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

        const fields = [
          {
            name: 'Game Mode',
            value: matchData.data.attributes.gameMode,
            inline: true,
          },
          {
            name: 'Map',
            value: matchData.data.attributes.mapName,
            inline: true,
          },
          {
            name: 'Rank',
            value: teammates[0].attributes.stats.winPlace,
            inline: true,
          },
        ];

        let squadFieldValue = '';

        teammates.forEach((t) => {
          squadFieldValue += MatchCommandHandler.getPlayerStatsString(t, regionName);
        });

        fields.push({
          name: 'Squad',
          value: squadFieldValue,
        });

        this.onResolved(bot, cmd, fields);
      })

      .catch((error) => {
        this.onError(bot, cmd, error);
      });
  }

  static getPlayerStatsString(player, regionName) {
    const { stats } = player.attributes;

    const playerName = stats.name;
    const pubgOpLink = pubgOpHelper.getUrlForPlayer(
      playerName,
      regionHelper.getAreaPartFromRegion(regionName),
    );

    return `[${playerName}](${pubgOpLink})
\`\`\`markdown
- Kills:      ${stats.kills} (${stats.headshotKills})
- Assists:    ${stats.assists}
- Damage:     ${math.round(stats.damageDealt, 2)}
- Heals:      ${stats.heals}
- Revives:    ${stats.revives}

- Win Points: ${stats.winPoints} (${stats.winPointsDelta})
\`\`\``;
  }
}

exports.getHandler = function getHandler() {
  return new MatchCommandHandler();
};
