const { CommandHandler } = require('./cmd-handler.js');
const math = require('../../math');

const regionHelper = require('../region-helper');
const playerHelper = require('../player-helper');
const pubgOpHelper = require('../pubg-op-helper');

const i18nCmdHandler = require('../../../i18n').getScope('commandHandler');
const i18nMatch = require('../../../i18n').getScope('match');

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
      this.onError(bot, cmd, new Error(i18nCmdHandler.t('invalidArguments')));
      return Promise.resolve();
    }

    return playerHelper.getPlayer(pubg, db, cmd.discordUser)

      .then((playerData) => {
        playerPubgId = playerData.id;
        regionName = playerData.attributes.shardId;

        const { matches } = playerData.relationships;

        if (matches.data.length === 0) {
          return Promise.reject(i18nMatch.t('noMatches'));
        }

        const [latestMatchInfo] = matches.data;

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
            name: i18nMatch.t('gameMode'),
            value: matchData.data.attributes.gameMode,
            inline: true,
          },
          {
            name: i18nMatch.t('map'),
            value: matchData.data.attributes.mapName,
            inline: true,
          },
          {
            name: i18nMatch.t('rank'),
            value: requestingPlayerRoster.attributes.stats.rank,
            inline: true,
          },
        ];

        let squadFieldValue = '';

        teammates.forEach((t) => {
          squadFieldValue += MatchCommandHandler.getPlayerStatsString(t, regionName);
        });

        fields.push({
          name: i18nMatch.t('squad'),
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
