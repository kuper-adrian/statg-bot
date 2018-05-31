const assert = require('chai').assert;
const expect = require('chai').expect;
const sinon = require('sinon');

const logger = require('../../../../src/modules/log').getLogger();
const pubg = require('../../../../src/modules/pubg');

const StatsCommandHandler = require('../../../../src/modules/cmd/command-handler/stats-cmd-handler');

describe('StatsCommandHandler.handle()', () => {

    let sandbox = {};

    let debugStub = {};
    let infoStub = {};
    let warnStub = {};
    let errorStub = {};

    beforeEach(() => {

        sandbox = sinon.sandbox.create();

        // stub all log functions
        debugStub = sandbox.stub(logger, "debug").callsFake((message) => {
            // do nothing
        });
        infoStub = sandbox.stub(logger, "info").callsFake((message) => {
            // do nothing
        });
        warnStub = sandbox.stub(logger, "warn").callsFake((message) => {
            // do nothing
        });
        errorStub = sandbox.stub(logger, "error").callsFake((message) => {
            // do nothing
        });
    });

    afterEach(() => {       
        sandbox.restore();
    });

    // ------------------------------------------------------------------------------------------
    // Tests
    // ------------------------------------------------------------------------------------------

    it('should get the pubg id for the discord user from the db', () => {

        const cmdHandler = StatsCommandHandler.getHandler();

        let passedTableName = '';
        let passedWhereMapping = {};

        const whereObj = {
            where: function(mapping) {
                passedWhereMapping = mapping;
                return Promise.resolve([
                    {
                        pubg_id: "some-pubg-id",
                        pubg_name: "some-pubg-name"
                    }
                ])
            }
        }
        const fromObj = {
            from: function(table) {
                passedTableName = table;
                return whereObj;
            }
        }
        const selectObj = {
            select: function() {
                return fromObj;
            }
        }

        const cmd = {
            discordUser: {
                id: "some-discord-id",
                channelId: "123"
            },
            arguments: []
        };
        const bot = {
            sendMessage: function(params) {

            }
        };
        const db = {
            knex: selectObj,
            TABLES: {
                registeredPlayer: "registered_player"
            }
        };

        const selectSpy = sandbox.spy(selectObj, "select");
        const fromSpy = sandbox.spy(fromObj, "from");
        const whereSpy = sandbox.spy(whereObj, "where");

        const seasonsStub = sandbox.stub(pubg, "seasons").callsFake(() => {
            return Promise.resolve({
                type: "seasons",
                data: [
                    {
                        id: "some-season-id-1",
                        attributes: {
                            isCurrentSeason: false
                        }
                    },
                    {
                        id: "some-season-id-2",
                        attributes: {
                            isCurrentSeason: false
                        }
                    },
                    {
                        id: "some-season-id-3",
                        attributes: {
                            isCurrentSeason: true
                        }
                    }
                ]
            });
        });

        const playerStatsStub = sandbox.stub(pubg, "playerStats").callsFake((pubgId, seasonId) => {
            return Promise.resolve({
                type: "stats",
                data: {
                    attributes: {
                        gameModeStats: {
                            solo: {
                                kills: 1,
                                assists: 2,
                                damageDealt: 123.12,
                                wins: 1,
                                winPoints: 1337,
                                roundsPlayed: 321
                            }
                        }
                    }
                }
            })
        });

        const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

        return handlePromise.then(() => {

            sandbox.assert.calledOnce(selectSpy);
            sandbox.assert.calledOnce(fromSpy);
            sandbox.assert.calledOnce(whereSpy);

            expect(passedTableName).to.be.equal(db.TABLES.registeredPlayer);
            expect(passedWhereMapping.discord_id).to.be.equal(cmd.discordUser.id);
        });
    });

    it('should throw an error if there is no player id for discord user in db', () => {
        
        const cmdHandler = StatsCommandHandler.getHandler();

        let tableName = '';
        let whereMapping = {};

        let passedBotMessage = '';

        const cmd = {
            discordUser: {
                id: "some-discord-id",
                channelId: "123"
            },
            arguments: []
        };
        const bot = {
            sendMessage: function(params) {
                passedBotMessage = params.message;
            }
        };
        const db = {
            knex: {
                select: function() {
                    return {
                        from : function(table) {

                            tableName = table;
                            return {
                                where: function(mapping) {

                                    whereMapping = mapping;
                                    return Promise.resolve([]) // empty array => no player found
                                }
                            }
                        }
                    }
                }
            },
            TABLES: {
                registeredPlayer: "registered_player"
            }
        };

        const sendMessageSpy = sandbox.spy(bot, "sendMessage");

        const seasonsStub = sandbox.stub(pubg, "seasons").callsFake(() => {
            return Promise.resolve({
                type: "seasons",
                data: [
                    {
                        id: "some-season-id-1",
                        attributes: {
                            isCurrentSeason: false
                        }
                    },
                    {
                        id: "some-season-id-2",
                        attributes: {
                            isCurrentSeason: false
                        }
                    },
                    {
                        id: "some-season-id-3",
                        attributes: {
                            isCurrentSeason: true
                        }
                    }
                ]
            });
        });

        const playerStatsStub = sandbox.stub(pubg, "playerStats").callsFake((pubgId, seasonId) => {
            return Promise.resolve({
                type: "stats",
                data: {
                    attributes: {
                        gameModeStats: {
                            solo: {
                                kills: 1,
                                assists: 2,
                                damageDealt: 123.12,
                                wins: 1,
                                winPoints: 1337,
                                roundsPlayed: 321
                            }
                        }
                    }
                }
            })
        });

        const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

        return handlePromise
            .then(() => {

                sandbox.assert.calledOnce(sendMessageSpy);

                expect(passedBotMessage).to.contain("Player not registered")

                sandbox.assert.notCalled(seasonsStub);
                sandbox.assert.notCalled(playerStatsStub);
            });
    });

    it('should request the seasons from pubg api after retrieving the id from db', () => {
        
        const cmdHandler = StatsCommandHandler.getHandler();

        const activeSeasonId = 'some-active-season-id';

        let passedTableName = '';
        let passedWhereMapping = {};

        let passedPubgPlayerId = '';
        let passedSeasonsId = '';

        const cmd = {
            discordUser: {
                id: "some-discord-id",
                channelId: "123"
            },
            arguments: []
        };
        const bot = {
            sendMessage: function(params) {

            }
        };
        const db = {
            knex: {
                select: function() {
                    return {
                        from : function(table) {

                            passedTableName = table;
                            return {
                                where: function(mapping) {

                                    passedWhereMapping = mapping;
                                    return Promise.resolve([
                                        {
                                            pubg_id: "some-pubg-id",
                                            pubg_name: "some-pubg-name"
                                        }
                                    ])
                                }
                            }
                        }
                    }
                }
            },
            TABLES: {
                registeredPlayer: "registered_player"
            }
        };

        const seasonsStub = sandbox.stub(pubg, "seasons").callsFake(() => {
            return Promise.resolve({
                type: "seasons",
                data: [
                    {
                        id: "some-season-id-1",
                        attributes: {
                            isCurrentSeason: false
                        }
                    },
                    {
                        id: "some-season-id-2",
                        attributes: {
                            isCurrentSeason: false
                        }
                    },
                    {
                        id: activeSeasonId,
                        attributes: {
                            isCurrentSeason: true
                        }
                    }
                ]
            });
        });

        const playerStatsStub = sandbox.stub(pubg, "playerStats").callsFake((pubgId, seasonId) => {

            passedPubgPlayerId = pubgId;
            passedSeasonsId = seasonId;

            return Promise.resolve({
                type: "stats",
                data: {
                    attributes: {
                        gameModeStats: {
                            solo: {
                                kills: 1,
                                assists: 2,
                                damageDealt: 123.12,
                                wins: 1,
                                winPoints: 1337,
                                roundsPlayed: 321
                            }
                        }
                    }
                }
            })
        });

        const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

        return handlePromise.then(() => {
            
            sandbox.assert.calledOnce(seasonsStub);

            expect(passedSeasonsId).to.be.equal(activeSeasonId);
        });
    });

    it('should request the stats for the given player id and current season', () => {
        
        const cmdHandler = StatsCommandHandler.getHandler();

        let tableName = '';
        let whereMapping = {};

        const pubgPlayerId = "some-player-id";
        const activeSeasonId = "some-season-id";

        let passedPubgPlayerId = '';
        let passedSeasonId = '';

        const cmd = {
            discordUser: {
                id: "some-discord-id",
                channelId: "123"
            },
            arguments: []
        };
        const bot = {
            sendMessage: function(params) {

            }
        };
        const db = {
            knex: {
                select: function() {
                    return {
                        from : function(table) {

                            tableName = table;
                            return {
                                where: function(mapping) {

                                    whereMapping = mapping;
                                    return Promise.resolve([
                                        {
                                            pubg_id: pubgPlayerId,
                                            pubg_name: "some-pubg-name"
                                        }
                                    ])
                                }
                            }
                        }
                    }
                }
            },
            TABLES: {
                registeredPlayer: "registered_player"
            }
        };

        const seasonsStub = sandbox.stub(pubg, "seasons").callsFake(() => {
            return Promise.resolve({
                type: "seasons",
                data: [
                    {
                        id: "some-season-id-1",
                        attributes: {
                            isCurrentSeason: false
                        }
                    },
                    {
                        id: "some-season-id-2",
                        attributes: {
                            isCurrentSeason: false
                        }
                    },
                    {
                        id: activeSeasonId,
                        attributes: {
                            isCurrentSeason: true
                        }
                    }
                ]
            });
        });

        const playerStatsStub = sandbox.stub(pubg, "playerStats").callsFake((pubgId, seasonId) => {

            passedPubgPlayerId = pubgId;
            passedSeasonId = seasonId;

            return Promise.resolve({
                type: "stats",
                data: {
                    attributes: {
                        gameModeStats: {
                            solo: {
                                kills: 1,
                                assists: 2,
                                damageDealt: 123.12,
                                wins: 1,
                                winPoints: 1337,
                                roundsPlayed: 321
                            }
                        }
                    }
                }
            })
        });

        const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

        return handlePromise.then(() => {
            sandbox.assert.calledOnce(playerStatsStub);

            expect(passedPubgPlayerId).to.be.equal(pubgPlayerId);
            expect(passedSeasonId).to.be.equal(passedSeasonId);
        });
    });

    it('should throw an error if multiple player ids are returned by db query', () => {
        // TODO
    })

    it('should return return the avg. stats for all game modes if no argument was passed to cmd', () => {
        // TODO
    });

    it('should return avg. stats for game mode "solo" when passed as argument', () => {
        // TODO
    });

    it('should return avg. stats for game mode "solo-fpp" when passed as argument', () => {
        // TODO
    });

    it('should return avg. stats for game mode "duo" when passed as argument', () => {
        // TODO
    });

    it('should return avg. stats for game mode "duo-fpp" when passed as argument', () => {
        // TODO
    });

    it('should return avg. stats for game mode "squad" when passed as argument', () => {
        // TODO
    });

    it('should return avg. stats for game mode "squad-fpp" when passed as argument', () => {
        // TODO
    });

    it('should throw an error if an invalid argument was passed', () => {
        // TODO
    });

    it('should throw an error if multiple arguments were passed', () => {
        // TODO
    });
});