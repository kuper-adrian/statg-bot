const { CommandHandler } = require('./cmd-handler.js');
const math = require('../../math');
const regionHelper = require('../region-helper');
const playerHelper = require('../player-helper');
const pubgOpHelper = require('../pubg-op-helper');
const formattingHelper = require('../formatting-helper');

const i18nPubg = require('../../../i18n').getScope('pubg');
const i18nCmdHandler = require('../../../i18n').getScope('commandHandler');
const i18nStats = require('../../../i18n').getScope('stats');

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

    let pubgId;
    let pubgPlayerName;
    let regionName = '';

    return playerHelper.getPlayer(pubg, db, cmd.discordUser)

      .then((playerData) => {
        pubgId = playerData.id;
        pubgPlayerName = playerData.attributes.name;
        regionName = playerData.attributes.shardId;

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
          this.onError(bot, cmd, new Error(i18nCmdHandler.t('invalidArguments')));
          return;
        } else if (AVAILABLE_ARGS.includes(cmd.arguments[0])) {
          [gameMode] = cmd.arguments;
          const filteredStats = {};

          filteredStats[gameMode] = stats.data.attributes.gameModeStats[gameMode];

          avgStats = StatsCommandHandler.getAverageStats(filteredStats);
          statMessage = StatsCommandHandler.getStatsAsDiscordFormattedString(avgStats);
        } else {
          this.onError(bot, cmd, new Error(i18nStats.t('invalidGameMode', { GAME_MODE: cmd.arguments[0] })));
          return;
        }

        const pubgOpLink = pubgOpHelper.getUrlForPlayer(
          pubgPlayerName,
          regionHelper.getAreaPartFromRegion(regionName),
        );

        const fields = [
          {
            name: i18nPubg.t('player'),
            value: `[${pubgPlayerName}](${pubgOpLink})`,
            inline: true,
          },
          {
            name: i18nPubg.t('gameMode'),
            value: gameMode,
            inline: true,
          },
          {
            name: i18nStats.t('currentSeasonStatistics'),
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

    result.avgKills = result.kills / (result.roundsPlayed - result.wins);
    result.avgAssists = result.assists / result.roundsPlayed;
    result.avgDamageDealt = result.damageDealt / result.roundsPlayed;
    result.avgWins = result.wins / result.roundsPlayed;
    result.avgWinPoints = result.winPoints / gameModeCount;

    return result;
  }

  static getStatsAsDiscordFormattedString(avgStats) {
    let killsTranslation = i18nPubg.t('kills');
    let assistsTranslation = i18nPubg.t('assists');
    let damageTranslation = i18nPubg.t('damage');
    let winsTranslation = i18nPubg.t('wins');
    let roundsPlayedTranslation = i18nPubg.t('roundsPlayed');

    const translations = [
      killsTranslation,
      assistsTranslation,
      damageTranslation,
      winsTranslation,
      roundsPlayedTranslation,
    ];

    // sort desc by length of word
    const maxWordLength = formattingHelper.longestWordLength(translations);

    killsTranslation = formattingHelper.appendWhitespaces(`${killsTranslation}:`, maxWordLength);
    assistsTranslation = formattingHelper.appendWhitespaces(`${assistsTranslation}:`, maxWordLength);
    damageTranslation = formattingHelper.appendWhitespaces(`${damageTranslation}:`, maxWordLength);
    winsTranslation = formattingHelper.appendWhitespaces(`${winsTranslation}:`, maxWordLength);
    roundsPlayedTranslation = formattingHelper.appendWhitespaces(
      `${roundsPlayedTranslation}:`,
      maxWordLength,
    );

    const averageAbbr = i18nStats.t('averageAbbr');

    const result = `\`\`\`markdown
- ${killsTranslation} ${avgStats.kills} (${averageAbbr} ${math.round(avgStats.avgKills, 2)})
- ${assistsTranslation} ${avgStats.assists} (${averageAbbr} ${math.round(avgStats.avgAssists, 2)})
- ${damageTranslation} ${math.round(avgStats.damageDealt, 2)} (${averageAbbr} ${math.round(avgStats.avgDamageDealt, 2)})
- ${winsTranslation} ${avgStats.wins} (${averageAbbr} ${math.round(avgStats.avgWins, 4)})
- ${roundsPlayedTranslation} ${avgStats.roundsPlayed}
\`\`\``;

    return result;
  }
}

exports.getHandler = function getHandler() {
  return new StatsCommandHandler();
};
