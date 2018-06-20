const CommandHandler = require('./cmd-handler.js').CommandHandler;
const math = require('../../math');

const AVAILABLE_ARGS = [
  'solo',
  'solo-fpp',
  'duo',
  'duo-fpp',
  'squad',
  'squad-fpp',
];

class StatsCommandHandler extends CommandHandler {
  handle(cmd, bot, db, pubg) {
    this.logger.info('Handling stats command!');

    const { channelId } = cmd.discordUser;
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
        return pubg.seasons(regionName);
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
        return pubg.playerStats(pubgId, seasonId, regionName);
      })

      .then((stats) => {
        this.logger.debug('Successfully fetched stats!');

        let avgStats;
        let message;


        if (cmd.arguments.length === 0) {
          avgStats = StatsCommandHandler.getAverageStats(stats.data.attributes.gameModeStats);
          message = StatsCommandHandler.getStatsAsDiscordFormattedString(pubgPlayerName, 'all', avgStats);
        } else if (cmd.arguments.length > 1) {
          this.onError(bot, channelId, 'invalid amount of arguments.');
          return;
        } else if (AVAILABLE_ARGS.includes(cmd.arguments[0])) {
          const gameMode = cmd.arguments[0];
          const filteredStats = {};

          filteredStats[gameMode] = stats.data.attributes.gameModeStats[gameMode];

          avgStats = StatsCommandHandler.getAverageStats(filteredStats);
          message = StatsCommandHandler.getStatsAsDiscordFormattedString(
            pubgPlayerName,
            gameMode,
            avgStats,
          );
        } else {
          this.onError(bot, channelId, `invalid game mode "${cmd.arguments[0]}"`);
          return;
        }

        bot.sendMessage({
          to: channelId,
          message,
        });
      })

      .catch((error) => {
        this.onError(bot, channelId, error);
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

  static getStatsAsDiscordFormattedString(pubgPlayerName, gameMode, avgStats) {
    const result = `Season stats for player **${pubgPlayerName}** (game mode: **${gameMode}**):
\`\`\`markdown
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
