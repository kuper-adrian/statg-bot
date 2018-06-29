const { CommandHandler } = require('./cmd-handler.js');
const math = require('../../math');
const regionHelper = require('../region-helper');
const pubgOpHelper = require('../pubg-op-helper');

const AVAILABLE_ARGS = [
  'solo',
  'solo-fpp',
  'duo',
  'duo-fpp',
  'squad',
  'squad-fpp',
];

/**
 * Command handler for !statg stats command. Shows stats for player.
 * @extends CommandHandler
 */
class StatsCommandHandler extends CommandHandler {
  handle(cmd, bot, db, pubg) {
    this.logger.info('Handling stats command!');

    const { id: discordId } = cmd.discordUser;
    let pubgId;
    let pubgPlayerName;
    let regionName = '';

    this.logger.debug('checking if player is registered');

    return db.getRegisteredPlayers({ discord_id: discordId })

      .then((rows) => {
        if (rows.length === 0) {
          return Promise.reject(new Error('Player not registered. Try register command first'));
        } else if (rows.length > 1) {
          return Promise.reject(new Error('Something really weird happened.'));
        }

        pubgId = rows[0].pubg_id;
        pubgPlayerName = rows[0].pubg_name;

        return db.getRegions({ id: rows[0].region_id });
      })

      .then((rows) => {
        if (rows.length !== 1) {
          return Promise.reject(new Error('Something really weird happened.'));
        }

        regionName = rows[0].region_name;
        return pubg.seasons({ region: regionName });
      })

      .then((seasons) => {
        this.logger.debug('Successfully fetched seasons data!');

        const { data: seasonsData } = seasons;
        const currentSeason = seasonsData.filter(s => s.attributes.isCurrentSeason)[0];

        this.logger.debug(`Id of current season: ${currentSeason.id}`);
        return currentSeason.id;
      })

      .then((seasonId) => {
        this.logger.debug('Fetching stats...');
        return pubg.playerStats({
          seasonId,
          playerId: pubgId,
          region: regionName,
        });
      })

      .then((stats) => {
        this.logger.debug('Successfully fetched stats!');

        let avgStats = {};
        let statMessage = '';
        let gameMode = '';

        if (cmd.arguments.length === 0) {
          gameMode = 'all';
          avgStats = StatsCommandHandler.getAverageStats(stats.data.attributes.gameModeStats);
          statMessage = StatsCommandHandler.getStatsAsDiscordFormattedString(avgStats);
        } else if (cmd.arguments.length > 1) {
          this.onError(bot, cmd, new Error('invalid amount of arguments.'));
          return;
        } else if (AVAILABLE_ARGS.includes(cmd.arguments[0])) {
          [gameMode] = cmd.arguments;
          const filteredStats = {};

          filteredStats[gameMode] = stats.data.attributes.gameModeStats[gameMode];

          avgStats = StatsCommandHandler.getAverageStats(filteredStats);
          statMessage = StatsCommandHandler.getStatsAsDiscordFormattedString(avgStats);
        } else {
          this.onError(bot, cmd, new Error(`invalid game mode "${cmd.arguments[0]}"`));
          return;
        }

        const pubgOpLink = pubgOpHelper.getUrlForPlayer(
          pubgPlayerName,
          regionHelper.getAreaPartFromRegion(regionName),
        );

        const fields = [
          {
            name: 'Player',
            value: `[${pubgPlayerName}](${pubgOpLink})`,
            inline: true,
          },
          {
            name: 'Game Mode',
            value: gameMode,
            inline: true,
          },
          {
            name: 'Current Season Statistics',
            value: statMessage,
          },
        ];

        this.onResolved(bot, cmd, fields);
      })

      .catch((error) => {
        this.onError(bot, cmd, error);
      });
  }

  static getAverageStats(gameModeStats) {
    const result = {
      kills: 0,
      assists: 0,
      damageDealt: 0.0,
      wins: 0,
      winPoints: 0.0,
      roundsPlayed: 0,
    };

    let gameModeCount = 0;
    Object.keys(gameModeStats).forEach((key) => {
      const gameMode = gameModeStats[key];

      result.kills += gameMode.kills;
      result.assists += gameMode.assists;
      result.damageDealt += gameMode.damageDealt;
      result.wins += gameMode.wins;
      result.winPoints += gameMode.winPoints;
      result.roundsPlayed += gameMode.roundsPlayed;

      gameModeCount += 1;
    });

    result.avgKills = result.kills / result.roundsPlayed;
    result.avgAssists = result.assists / result.roundsPlayed;
    result.avgDamageDealt = result.damageDealt / result.roundsPlayed;
    result.avgWins = result.wins / result.roundsPlayed;
    result.avgWinPoints = result.winPoints / gameModeCount;

    return result;
  }

  static getStatsAsDiscordFormattedString(avgStats) {
    const result = `\`\`\`markdown
- Kills:           ${avgStats.kills} (avg. ${math.round(avgStats.avgKills, 2)})
- Assists:         ${avgStats.assists} (avg. ${math.round(avgStats.avgAssists, 2)})
- Damage:          ${math.round(avgStats.damageDealt, 2)} (avg. ${math.round(avgStats.avgDamageDealt, 2)})
- Wins:            ${avgStats.wins} (avg. ${math.round(avgStats.avgWins, 4)})
- Rounds Played:   ${avgStats.roundsPlayed}
\`\`\``;

    return result;
  }
}

exports.getHandler = function getHandler() {
  return new StatsCommandHandler();
};
