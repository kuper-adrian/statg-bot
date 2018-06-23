/* eslint-env mocha */

const { expect } = require('chai');
const sinon = require('sinon');

const logger = require('../../../../src/modules/log').getLogger();
const StatsCommandHandler = require('../../../../src/modules/cmd/command-handler/stats-cmd-handler');

describe('StatsCommandHandler', () => {
  let sandbox = {};

  let cmd = {};
  let bot = {};
  let db = {};
  let pubg = {};

  let passedChannelId = '';
  let passedEmbed = {};

  let sendMessageSpy = {};

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // stub all log functions
    sandbox.stub(logger, 'debug').callsFake(() => {
      // do nothing
    });
    sandbox.stub(logger, 'info').callsFake(() => {
      // do nothing
    });
    sandbox.stub(logger, 'warn').callsFake(() => {
      // do nothing
    });
    sandbox.stub(logger, 'error').callsFake(() => {
      // do nothing
    });

    cmd = {
      discordUser: {
        id: 'some-discord-id',
        channelId: '123',
      },
      arguments: [],
    };

    bot = {
      sendMessage: (params) => {
        passedChannelId = params.to;
        passedEmbed = params.embed;
      },
    };

    db = {
      getRegions: () => Promise.resolve([
        {
          id: 1,
          region_name: 'pc-eu',
        },
      ]),
      getRegisteredPlayers: () => Promise.resolve([]),
    };

    pubg = {
      seasons: () => Promise.resolve({}),
      playerStats: () => Promise.resolve({}),
    };

    sendMessageSpy = sandbox.spy(bot, 'sendMessage');
  });

  afterEach(() => {
    sandbox.restore();
  });

  // ------------------------------------------------------------------------------------------
  // Tests
  // ------------------------------------------------------------------------------------------

  describe('handle()', () => {
    it('should get the pubg id for the discord user from the db', () => {
      const cmdHandler = StatsCommandHandler.getHandler();

      const getPlayersStub = sandbox.stub(db, 'getRegisteredPlayers').callsFake(() => Promise.resolve([
        {
          pubg_id: 'some-pubg-id',
          pubg_name: 'some-pubg-name',
        },
      ]));

      sandbox.stub(pubg, 'seasons').callsFake(() => Promise.resolve({
        type: 'seasons',
        data: [
          {
            id: 'some-season-id-1',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: 'some-season-id-2',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: 'some-season-id-3',
            attributes: {
              isCurrentSeason: true,
            },
          },
        ],
      }));

      sandbox.stub(pubg, 'playerStats').callsFake(() => Promise.resolve({
        type: 'stats',
        data: {
          attributes: {
            gameModeStats: {
              solo: {
                kills: 1,
                assists: 2,
                damageDealt: 123.12,
                wins: 1,
                winPoints: 1337,
                roundsPlayed: 321,
              },
            },
          },
        },
      }));

      const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.calledOnce(getPlayersStub);
      });
    });


    it('should query the database for the region of the player', () => {
      const cmdHandler = StatsCommandHandler.getHandler();

      const getRegionsSpy = sandbox.spy(db, 'getRegions');

      sandbox.stub(db, 'getRegisteredPlayers').callsFake(() => Promise.resolve([
        {
          pubg_id: 'some-pubg-id',
          pubg_name: 'some-pubg-name',
        },
      ]));

      sandbox.stub(pubg, 'seasons').callsFake(() => Promise.resolve({
        type: 'seasons',
        data: [
          {
            id: 'some-season-id-1',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: 'some-season-id-2',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: 'some-season-id-3',
            attributes: {
              isCurrentSeason: true,
            },
          },
        ],
      }));

      sandbox.stub(pubg, 'playerStats').callsFake(() => Promise.resolve({
        type: 'stats',
        data: {
          attributes: {
            gameModeStats: {
              solo: {
                kills: 1,
                assists: 2,
                damageDealt: 123.12,
                wins: 1,
                winPoints: 1337,
                roundsPlayed: 321,
              },
            },
          },
        },
      }));

      const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.calledOnce(getRegionsSpy);
      });
    });

    it('should request the seasons from pubg api after retrieving the id from db', () => {
      const cmdHandler = StatsCommandHandler.getHandler();

      let passedSeasonsId = '';
      const activeSeasonId = 'some-active-season-id';

      sandbox.stub(db, 'getRegisteredPlayers').callsFake(() => Promise.resolve([
        {
          pubg_id: 'some-pubg-id',
          pubg_name: 'some-pubg-name',
        },
      ]));

      const seasonsStub = sandbox.stub(pubg, 'seasons').callsFake(() => Promise.resolve({
        type: 'seasons',
        data: [
          {
            id: 'some-season-id-1',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: 'some-season-id-2',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: activeSeasonId,
            attributes: {
              isCurrentSeason: true,
            },
          },
        ],
      }));

      sandbox.stub(pubg, 'playerStats').callsFake((pubgId, seasonId) => {
        passedSeasonsId = seasonId;

        return Promise.resolve({
          type: 'stats',
          data: {
            attributes: {
              gameModeStats: {
                solo: {
                  kills: 1,
                  assists: 2,
                  damageDealt: 123.12,
                  wins: 1,
                  winPoints: 1337,
                  roundsPlayed: 321,
                },
              },
            },
          },
        });
      });

      const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.calledOnce(seasonsStub);
        expect(passedSeasonsId).to.be.equal(activeSeasonId);
      });
    });

    it('should request the stats for the given player id and current season', () => {
      const cmdHandler = StatsCommandHandler.getHandler();

      let passedPubgPlayerId = '';
      let passedSeasonId = '';
      const pubgPlayerId = 'some-player-id';
      const activeSeasonId = 'some-season-id';

      sandbox.stub(db, 'getRegisteredPlayers').callsFake(() => Promise.resolve([
        {
          pubg_id: pubgPlayerId,
          pubg_name: 'some-pubg-name',
        },
      ]));

      sandbox.stub(pubg, 'seasons').callsFake(() => Promise.resolve({
        type: 'seasons',
        data: [
          {
            id: 'some-season-id-1',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: 'some-season-id-2',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: activeSeasonId,
            attributes: {
              isCurrentSeason: true,
            },
          },
        ],
      }));

      const playerStatsStub = sandbox.stub(pubg, 'playerStats').callsFake((pubgId, seasonId) => {
        passedPubgPlayerId = pubgId;
        passedSeasonId = seasonId;

        return Promise.resolve({
          type: 'stats',
          data: {
            attributes: {
              gameModeStats: {
                solo: {
                  kills: 1,
                  assists: 2,
                  damageDealt: 123.12,
                  wins: 1,
                  winPoints: 1337,
                  roundsPlayed: 321,
                },
              },
            },
          },
        });
      });

      const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.calledOnce(playerStatsStub);

        expect(passedPubgPlayerId).to.be.equal(pubgPlayerId);
        expect(passedSeasonId).to.be.equal(passedSeasonId);
      });
    });

    it('should return the stats for all game modes if no argument was passed to cmd', () => {
      const cmdHandler = StatsCommandHandler.getHandler();

      const pubgPlayerId = 'some-player-id';
      const pubgPlayerName = 'some-pubg-name';
      const activeSeasonId = 'some-season-id';

      const stats = {
        solo: {
          kills: 2,
          assists: 1,
          damageDealt: 100.0,
          wins: 1,
          winPoints: 1500,
          roundsPlayed: 1,
        },
        squad: {
          kills: 2,
          assists: 1,
          damageDealt: 100.0,
          wins: 0,
          winPoints: 1500,
          roundsPlayed: 1,
        },
      };

      sandbox.stub(db, 'getRegisteredPlayers').callsFake(() => Promise.resolve([
        {
          pubg_id: pubgPlayerId,
          pubg_name: pubgPlayerName,
        },
      ]));

      sandbox.stub(pubg, 'seasons').callsFake(() => Promise.resolve({
        type: 'seasons',
        data: [
          {
            id: 'some-season-id-1',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: 'some-season-id-2',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: activeSeasonId,
            attributes: {
              isCurrentSeason: true,
            },
          },
        ],
      }));

      sandbox.stub(pubg, 'playerStats').callsFake(() => Promise.resolve({
        type: 'stats',
        data: {
          attributes: {
            gameModeStats: stats,
          },
        },
      }));

      const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.calledOnce(sendMessageSpy);

        expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);

        expect(passedEmbed.fields[0].value).to.contain(pubgPlayerName);
        expect(passedEmbed.fields[1].value).to.contain('all');

        expect(passedEmbed.fields[2].value).to.contain('Kills');
        expect(passedEmbed.fields[2].value).to.contain(stats.solo.kills + stats.squad.kills);
        expect(passedEmbed.fields[2].value).to.contain((stats.solo.kills + stats.squad.kills) /
          (stats.solo.roundsPlayed + stats.squad.roundsPlayed));

        expect(passedEmbed.fields[2].value).to.contain('Assists');
        expect(passedEmbed.fields[2].value).to.contain(stats.solo.assists + stats.squad.assists);
        expect(passedEmbed.fields[2].value).to.contain((stats.solo.assists + stats.squad.assists) /
        (stats.solo.roundsPlayed + stats.squad.roundsPlayed));

        expect(passedEmbed.fields[2].value).to.contain('Wins');
        expect(passedEmbed.fields[2].value).to.contain(stats.solo.wins + stats.squad.wins);
        expect(passedEmbed.fields[2].value).to.contain((stats.solo.wins + stats.squad.wins) /
          (stats.solo.roundsPlayed + stats.squad.roundsPlayed));
      });
    });

    it('should return avg. stats for game mode "solo" when passed as argument', () => {
      const cmdHandler = StatsCommandHandler.getHandler();

      const pubgPlayerId = 'some-player-id';
      const pubgPlayerName = 'some-pubg-name';
      const activeSeasonId = 'some-season-id';

      const stats = {
        solo: {
          kills: 2,
          assists: 1,
          damageDealt: 100.0,
          wins: 1,
          winPoints: 1500,
          roundsPlayed: 1,
        },
        duo: {
          kills: 3,
          assists: 4,
          damageDealt: 400.0,
          wins: 0,
          winPoints: 1500,
          roundsPlayed: 123,
        },
        squad: {
          kills: 5,
          assists: 6,
          damageDealt: 3200.0,
          wins: 0,
          winPoints: 1500,
          roundsPlayed: 321,
        },
      };

      cmd.arguments = [
        'solo',
      ];

      sandbox.stub(db, 'getRegisteredPlayers').callsFake(() => Promise.resolve([
        {
          pubg_id: pubgPlayerId,
          pubg_name: pubgPlayerName,
        },
      ]));

      sandbox.stub(pubg, 'seasons').callsFake(() => Promise.resolve({
        type: 'seasons',
        data: [
          {
            id: 'some-season-id-1',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: 'some-season-id-2',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: activeSeasonId,
            attributes: {
              isCurrentSeason: true,
            },
          },
        ],
      }));

      sandbox.stub(pubg, 'playerStats').callsFake(() => Promise.resolve({
        type: 'stats',
        data: {
          attributes: {
            gameModeStats: stats,
          },
        },
      }));

      const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.calledOnce(sendMessageSpy);

        expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);

        expect(passedEmbed.fields[1].value).to.contain('solo');
        expect(passedEmbed.fields[0].value).to.contain(pubgPlayerName);

        expect(passedEmbed.fields[2].value).to.contain('Kills');
        expect(passedEmbed.fields[2].value).to.contain(stats.solo.kills);
        expect(passedEmbed.fields[2].value).to.contain((stats.solo.kills) /
          (stats.solo.roundsPlayed));

        expect(passedEmbed.fields[2].value).to.contain('Assists');
        expect(passedEmbed.fields[2].value).to.contain(stats.solo.assists);
        expect(passedEmbed.fields[2].value).to.contain((stats.solo.assists) /
          (stats.solo.roundsPlayed));

        expect(passedEmbed.fields[2].value).to.contain('Wins');
        expect(passedEmbed.fields[2].value).to.contain(stats.solo.wins);
        expect(passedEmbed.fields[2].value).to.contain((stats.solo.wins) /
          (stats.solo.roundsPlayed));
      });
    });

    it('should return avg. stats for game mode "solo-fpp" when passed as argument', () => {
      const cmdHandler = StatsCommandHandler.getHandler();

      const pubgPlayerId = 'some-player-id';
      const pubgPlayerName = 'some-pubg-name';
      const activeSeasonId = 'some-season-id';

      const stats = {
        solo: {
          kills: 7,
          assists: 8,
          damageDealt: 4300.0,
          wins: 0,
          winPoints: 1500,
          roundsPlayed: 432,
        },
        'solo-fpp': {
          kills: 2,
          assists: 1,
          damageDealt: 100.0,
          wins: 1,
          winPoints: 1500,
          roundsPlayed: 1,
        },
        duo: {
          kills: 3,
          assists: 4,
          damageDealt: 400.0,
          wins: 0,
          winPoints: 1500,
          roundsPlayed: 123,
        },
        squad: {
          kills: 5,
          assists: 6,
          damageDealt: 3200.0,
          wins: 0,
          winPoints: 1500,
          roundsPlayed: 321,
        },
      };

      cmd.arguments = [
        'solo-fpp',
      ];

      sandbox.stub(db, 'getRegisteredPlayers').callsFake(() => Promise.resolve([
        {
          pubg_id: pubgPlayerId,
          pubg_name: pubgPlayerName,
        },
      ]));

      sandbox.stub(pubg, 'seasons').callsFake(() => Promise.resolve({
        type: 'seasons',
        data: [
          {
            id: 'some-season-id-1',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: 'some-season-id-2',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: activeSeasonId,
            attributes: {
              isCurrentSeason: true,
            },
          },
        ],
      }));

      sandbox.stub(pubg, 'playerStats').callsFake(() => Promise.resolve({
        type: 'stats',
        data: {
          attributes: {
            gameModeStats: stats,
          },
        },
      }));

      const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.calledOnce(sendMessageSpy);

        expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);

        expect(passedEmbed.fields[1].value).to.contain('solo-fpp');
        expect(passedEmbed.fields[0].value).to.contain(pubgPlayerName);

        expect(passedEmbed.fields[2].value).to.contain('Kills');
        expect(passedEmbed.fields[2].value).to.contain(stats['solo-fpp'].kills);
        expect(passedEmbed.fields[2].value).to.contain((stats['solo-fpp'].kills) / (stats['solo-fpp'].roundsPlayed));

        expect(passedEmbed.fields[2].value).to.contain('Assists');
        expect(passedEmbed.fields[2].value).to.contain(stats['solo-fpp'].assists);
        expect(passedEmbed.fields[2].value).to.contain((stats['solo-fpp'].assists) / (stats['solo-fpp'].roundsPlayed));

        expect(passedEmbed.fields[2].value).to.contain('Wins');
        expect(passedEmbed.fields[2].value).to.contain(stats['solo-fpp'].wins);
        expect(passedEmbed.fields[2].value).to.contain((stats['solo-fpp'].wins) / (stats['solo-fpp'].roundsPlayed));
      });
    });

    it('should return avg. stats for game mode "duo" when passed as argument', () => {
      const cmdHandler = StatsCommandHandler.getHandler();

      const pubgPlayerId = 'some-player-id';
      const pubgPlayerName = 'some-pubg-name';
      const activeSeasonId = 'some-season-id';

      const stats = {
        solo: {
          kills: 7,
          assists: 8,
          damageDealt: 4300.0,
          wins: 0,
          winPoints: 1500,
          roundsPlayed: 432,
        },
        'solo-fpp': {
          kills: 2,
          assists: 1,
          damageDealt: 100.0,
          wins: 1,
          winPoints: 1500,
          roundsPlayed: 1,
        },
        duo: {
          kills: 20,
          assists: 10,
          damageDealt: 400.0,
          wins: 0,
          winPoints: 1500,
          roundsPlayed: 10,
        },
        squad: {
          kills: 5,
          assists: 6,
          damageDealt: 3200.0,
          wins: 0,
          winPoints: 1500,
          roundsPlayed: 321,
        },
      };

      cmd.arguments = [
        'duo',
      ];

      sandbox.stub(db, 'getRegisteredPlayers').callsFake(() => Promise.resolve([
        {
          pubg_id: pubgPlayerId,
          pubg_name: pubgPlayerName,
        },
      ]));

      sandbox.stub(pubg, 'seasons').callsFake(() => Promise.resolve({
        type: 'seasons',
        data: [
          {
            id: 'some-season-id-1',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: 'some-season-id-2',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: activeSeasonId,
            attributes: {
              isCurrentSeason: true,
            },
          },
        ],
      }));

      sandbox.stub(pubg, 'playerStats').callsFake(() => Promise.resolve({
        type: 'stats',
        data: {
          attributes: {
            gameModeStats: stats,
          },
        },
      }));

      const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.calledOnce(sendMessageSpy);

        expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);

        expect(passedEmbed.fields[1].value).to.contain('duo');
        expect(passedEmbed.fields[0].value).to.contain(pubgPlayerName);

        expect(passedEmbed.fields[2].value).to.contain('Kills');
        expect(passedEmbed.fields[2].value).to.contain(stats.duo.kills);
        expect(passedEmbed.fields[2].value).to.contain((stats.duo.kills) /
          (stats.duo.roundsPlayed));

        expect(passedEmbed.fields[2].value).to.contain('Assists');
        expect(passedEmbed.fields[2].value).to.contain(stats.duo.assists);
        expect(passedEmbed.fields[2].value).to.contain((stats.duo.assists) /
          (stats.duo.roundsPlayed));

        expect(passedEmbed.fields[2].value).to.contain('Wins');
        expect(passedEmbed.fields[2].value).to.contain(stats.duo.wins);
        expect(passedEmbed.fields[2].value).to.contain((stats.duo.wins) /
          (stats.duo.roundsPlayed));
      });
    });

    it('should return avg. stats for game mode "duo-fpp" when passed as argument', () => {
      const cmdHandler = StatsCommandHandler.getHandler();


      const pubgPlayerId = 'some-player-id';
      const pubgPlayerName = 'some-pubg-name';
      const activeSeasonId = 'some-season-id';

      const stats = {
        solo: {
          kills: 7,
          assists: 8,
          damageDealt: 4300.0,
          wins: 0,
          winPoints: 1500,
          roundsPlayed: 432,
        },
        'duo-fpp': {
          kills: 2,
          assists: 1,
          damageDealt: 100.0,
          wins: 1,
          winPoints: 1500,
          roundsPlayed: 1,
        },
        duo: {
          kills: 3,
          assists: 4,
          damageDealt: 400.0,
          wins: 0,
          winPoints: 1500,
          roundsPlayed: 123,
        },
        squad: {
          kills: 5,
          assists: 6,
          damageDealt: 3200.0,
          wins: 0,
          winPoints: 1500,
          roundsPlayed: 321,
        },
      };

      cmd.arguments = [
        'duo-fpp',
      ];

      sandbox.stub(db, 'getRegisteredPlayers').callsFake(() => Promise.resolve([
        {
          pubg_id: pubgPlayerId,
          pubg_name: pubgPlayerName,
        },
      ]));

      sandbox.stub(pubg, 'seasons').callsFake(() => Promise.resolve({
        type: 'seasons',
        data: [
          {
            id: 'some-season-id-1',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: 'some-season-id-2',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: activeSeasonId,
            attributes: {
              isCurrentSeason: true,
            },
          },
        ],
      }));

      sandbox.stub(pubg, 'playerStats').callsFake(() => Promise.resolve({
        type: 'stats',
        data: {
          attributes: {
            gameModeStats: stats,
          },
        },
      }));

      const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.calledOnce(sendMessageSpy);

        expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);

        expect(passedEmbed.fields[1].value).to.contain('duo-fpp');
        expect(passedEmbed.fields[0].value).to.contain(pubgPlayerName);

        expect(passedEmbed.fields[2].value).to.contain('Kills');
        expect(passedEmbed.fields[2].value).to.contain(stats['duo-fpp'].kills);
        expect(passedEmbed.fields[2].value).to.contain((stats['duo-fpp'].kills) / (stats['duo-fpp'].roundsPlayed));

        expect(passedEmbed.fields[2].value).to.contain('Assists');
        expect(passedEmbed.fields[2].value).to.contain(stats['duo-fpp'].assists);
        expect(passedEmbed.fields[2].value).to.contain((stats['duo-fpp'].assists) / (stats['duo-fpp'].roundsPlayed));

        expect(passedEmbed.fields[2].value).to.contain('Wins');
        expect(passedEmbed.fields[2].value).to.contain(stats['duo-fpp'].wins);
        expect(passedEmbed.fields[2].value).to.contain((stats['duo-fpp'].wins) / (stats['duo-fpp'].roundsPlayed));
      });
    });

    it('should return avg. stats for game mode "squad" when passed as argument', () => {
      const cmdHandler = StatsCommandHandler.getHandler();

      const pubgPlayerId = 'some-player-id';
      const pubgPlayerName = 'some-pubg-name';
      const activeSeasonId = 'some-season-id';

      const stats = {
        solo: {
          kills: 7,
          assists: 8,
          damageDealt: 4300.0,
          wins: 0,
          winPoints: 1500,
          roundsPlayed: 432,
        },
        'solo-fpp': {
          kills: 2,
          assists: 1,
          damageDealt: 100.0,
          wins: 1,
          winPoints: 1500,
          roundsPlayed: 1,
        },
        duo: {
          kills: 3,
          assists: 4,
          damageDealt: 400.0,
          wins: 0,
          winPoints: 1500,
          roundsPlayed: 123,
        },
        squad: {
          kills: 30,
          assists: 15,
          damageDealt: 3200.0,
          wins: 0,
          winPoints: 1500,
          roundsPlayed: 10,
        },
      };

      cmd.arguments = [
        'squad',
      ];

      sandbox.stub(db, 'getRegisteredPlayers').callsFake(() => Promise.resolve([
        {
          pubg_id: pubgPlayerId,
          pubg_name: pubgPlayerName,
        },
      ]));

      sandbox.stub(pubg, 'seasons').callsFake(() => Promise.resolve({
        type: 'seasons',
        data: [
          {
            id: 'some-season-id-1',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: 'some-season-id-2',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: activeSeasonId,
            attributes: {
              isCurrentSeason: true,
            },
          },
        ],
      }));

      sandbox.stub(pubg, 'playerStats').callsFake(() => Promise.resolve({
        type: 'stats',
        data: {
          attributes: {
            gameModeStats: stats,
          },
        },
      }));

      const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.calledOnce(sendMessageSpy);

        expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);

        expect(passedEmbed.fields[1].value).to.contain('squad');
        expect(passedEmbed.fields[0].value).to.contain(pubgPlayerName);

        expect(passedEmbed.fields[2].value).to.contain('Kills');
        expect(passedEmbed.fields[2].value).to.contain(stats.squad.kills);
        expect(passedEmbed.fields[2].value).to.contain((stats.squad.kills) /
          (stats.squad.roundsPlayed));

        expect(passedEmbed.fields[2].value).to.contain('Assists');
        expect(passedEmbed.fields[2].value).to.contain(stats.squad.assists);
        expect(passedEmbed.fields[2].value).to.contain((stats.squad.assists) /
          (stats.squad.roundsPlayed));

        expect(passedEmbed.fields[2].value).to.contain('Wins');
        expect(passedEmbed.fields[2].value).to.contain(stats.squad.wins);
        expect(passedEmbed.fields[2].value).to.contain((stats.squad.wins) /
          (stats.squad.roundsPlayed));
      });
    });

    it('should return avg. stats for game mode "squad-fpp" when passed as argument', () => {
      const cmdHandler = StatsCommandHandler.getHandler();

      const pubgPlayerId = 'some-player-id';
      const pubgPlayerName = 'some-pubg-name';
      const activeSeasonId = 'some-season-id';

      const stats = {
        solo: {
          kills: 7,
          assists: 8,
          damageDealt: 4300.0,
          wins: 0,
          winPoints: 1500,
          roundsPlayed: 432,
        },
        'squad-fpp': {
          kills: 2,
          assists: 1,
          damageDealt: 100.0,
          wins: 1,
          winPoints: 1500,
          roundsPlayed: 1,
        },
        duo: {
          kills: 3,
          assists: 4,
          damageDealt: 400.0,
          wins: 0,
          winPoints: 1500,
          roundsPlayed: 123,
        },
        squad: {
          kills: 5,
          assists: 6,
          damageDealt: 3200.0,
          wins: 0,
          winPoints: 1500,
          roundsPlayed: 321,
        },
      };

      cmd.arguments = [
        'squad-fpp',
      ];

      sandbox.stub(db, 'getRegisteredPlayers').callsFake(() => Promise.resolve([
        {
          pubg_id: pubgPlayerId,
          pubg_name: pubgPlayerName,
        },
      ]));

      sandbox.stub(pubg, 'seasons').callsFake(() => Promise.resolve({
        type: 'seasons',
        data: [
          {
            id: 'some-season-id-1',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: 'some-season-id-2',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: activeSeasonId,
            attributes: {
              isCurrentSeason: true,
            },
          },
        ],
      }));

      sandbox.stub(pubg, 'playerStats').callsFake(() => Promise.resolve({
        type: 'stats',
        data: {
          attributes: {
            gameModeStats: stats,
          },
        },
      }));

      const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.calledOnce(sendMessageSpy);

        expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);

        expect(passedEmbed.fields[1].value).to.contain('squad-fpp');
        expect(passedEmbed.fields[0].value).to.contain(pubgPlayerName);

        expect(passedEmbed.fields[2].value).to.contain('Kills');
        expect(passedEmbed.fields[2].value).to.contain(stats['squad-fpp'].kills);
        expect(passedEmbed.fields[2].value).to.contain((stats['squad-fpp'].kills) / (stats['squad-fpp'].roundsPlayed));

        expect(passedEmbed.fields[2].value).to.contain('Assists');
        expect(passedEmbed.fields[2].value).to.contain(stats['squad-fpp'].assists);
        expect(passedEmbed.fields[2].value).to.contain((stats['squad-fpp'].assists) / (stats['squad-fpp'].roundsPlayed));

        expect(passedEmbed.fields[2].value).to.contain('Wins');
        expect(passedEmbed.fields[2].value).to.contain(stats['squad-fpp'].wins);
        expect(passedEmbed.fields[2].value).to.contain((stats['squad-fpp'].wins) / (stats['squad-fpp'].roundsPlayed));
      });
    });

    it('should send an error error message if there is no player id for discord user in db', () => {
      const cmdHandler = StatsCommandHandler.getHandler();

      const seasonsStub = sandbox.stub(pubg, 'seasons').callsFake(() => Promise.resolve({
        type: 'seasons',
        data: [
          {
            id: 'some-season-id-1',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: 'some-season-id-2',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: 'some-season-id-3',
            attributes: {
              isCurrentSeason: true,
            },
          },
        ],
      }));

      const playerStatsStub = sandbox.stub(pubg, 'playerStats').callsFake(() => Promise.resolve({
        type: 'stats',
        data: {
          attributes: {
            gameModeStats: {
              solo: {
                kills: 1,
                assists: 2,
                damageDealt: 123.12,
                wins: 1,
                winPoints: 1337,
                roundsPlayed: 321,
              },
            },
          },
        },
      }));

      const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.calledOnce(sendMessageSpy);

        expect(passedEmbed.fields[0].value).to.contain('Player not registered');

        sandbox.assert.notCalled(seasonsStub);
        sandbox.assert.notCalled(playerStatsStub);
      });
    });

    it('should send an error message if multiple player ids are returned by db query', () => {
      const cmdHandler = StatsCommandHandler.getHandler();

      sandbox.stub(db, 'getRegisteredPlayers').callsFake(() => Promise.resolve([
        {
          pubg_id: 'some-pubg-id1',
          pubg_name: 'some-pubg-name1',
        },
        {
          pubg_id: 'some-pubg-id2',
          pubg_name: 'some-pubg-name2',
        },
      ]));

      const seasonsStub = sandbox.stub(pubg, 'seasons').callsFake(() => Promise.resolve({
        type: 'seasons',
        data: [
          {
            id: 'some-season-id-1',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: 'some-season-id-2',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: 'some-season-id-3',
            attributes: {
              isCurrentSeason: true,
            },
          },
        ],
      }));

      const playerStatsStub = sandbox.stub(pubg, 'playerStats').callsFake(() => Promise.resolve({
        type: 'stats',
        data: {
          attributes: {
            gameModeStats: {
              solo: {
                kills: 1,
                assists: 2,
                damageDealt: 123.12,
                wins: 1,
                winPoints: 1337,
                roundsPlayed: 321,
              },
            },
          },
        },
      }));

      const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.calledOnce(sendMessageSpy);

        expect(passedEmbed.fields[0].value).to.be.not.equal(undefined);
        expect(passedEmbed.fields[0].value).to.be.not.equal(null);
        expect(passedEmbed.fields[0].value.length).to.be.greaterThan(0);

        sandbox.assert.notCalled(seasonsStub);
        sandbox.assert.notCalled(playerStatsStub);
      });
    });

    it('should send an error message if an invalid argument was passed', () => {
      const cmdHandler = StatsCommandHandler.getHandler();

      cmd.arguments = [
        'invalid',
      ];

      sandbox.stub(db, 'getRegisteredPlayers').callsFake(() => Promise.resolve([
        {
          pubg_id: 'some-pubg-id1',
          pubg_name: 'some-pubg-name1',
        },
      ]));

      sandbox.stub(pubg, 'seasons').callsFake(() => Promise.resolve({
        type: 'seasons',
        data: [
          {
            id: 'some-season-id-1',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: 'some-season-id-2',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: 'some-season-id-3',
            attributes: {
              isCurrentSeason: true,
            },
          },
        ],
      }));

      sandbox.stub(pubg, 'playerStats').callsFake(() => Promise.resolve({
        type: 'stats',
        data: {
          attributes: {
            gameModeStats: {
              solo: {
                kills: 1,
                assists: 2,
                damageDealt: 123.12,
                wins: 1,
                winPoints: 1337,
                roundsPlayed: 321,
              },
            },
          },
        },
      }));

      const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.calledOnce(sendMessageSpy);
        expect(passedEmbed.fields[0].value).to.contain('invalid game mode "invalid"');
      });
    });

    it('should send an error message if multiple arguments were passed', () => {
      const cmdHandler = StatsCommandHandler.getHandler();

      cmd.arguments = [
        'solo',
        'squad',
      ];

      sandbox.stub(db, 'getRegisteredPlayers').callsFake(() => Promise.resolve([
        {
          pubg_id: 'some-pubg-id1',
          pubg_name: 'some-pubg-name1',
        },
      ]));

      sandbox.stub(pubg, 'seasons').callsFake(() => Promise.resolve({
        type: 'seasons',
        data: [
          {
            id: 'some-season-id-1',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: 'some-season-id-2',
            attributes: {
              isCurrentSeason: false,
            },
          },
          {
            id: 'some-season-id-3',
            attributes: {
              isCurrentSeason: true,
            },
          },
        ],
      }));

      sandbox.stub(pubg, 'playerStats').callsFake(() => Promise.resolve({
        type: 'stats',
        data: {
          attributes: {
            gameModeStats: {
              solo: {
                kills: 1,
                assists: 2,
                damageDealt: 123.12,
                wins: 1,
                winPoints: 1337,
                roundsPlayed: 321,
              },
            },
          },
        },
      }));

      const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.calledOnce(sendMessageSpy);
        expect(passedEmbed.fields[0].value).to.contain('invalid amount of arguments');
      });
    });
  });
});
