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

        sandbox = sinon.createSandbox();

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

    // it('should get the pubg id for the discord user from the db', () => {

    //     const cmdHandler = StatsCommandHandler.getHandler();

    //     let passedTableName = '';
    //     let passedWhereMapping = {};

    //     const whereObj = {
    //         where: function(mapping) {
    //             passedWhereMapping = mapping;
    //             return Promise.resolve([
    //                 {
    //                     pubg_id: "some-pubg-id",
    //                     pubg_name: "some-pubg-name"
    //                 }
    //             ])
    //         }
    //     }
    //     const fromObj = {
    //         from: function(table) {
    //             passedTableName = table;
    //             return whereObj;
    //         }
    //     }
    //     const selectObj = {
    //         select: function() {
    //             return fromObj;
    //         }
    //     }

    //     const cmd = {
    //         discordUser: {
    //             id: "some-discord-id",
    //             channelId: "123"
    //         },
    //         arguments: []
    //     };
    //     const bot = {
    //         sendMessage: function(params) {

    //         }
    //     };
    //     const db = {
    //         knex: selectObj,
    //         TABLES: {
    //             registeredPlayer: "registered_player"
    //         }
    //     };

    //     const selectSpy = sandbox.spy(selectObj, "select");
    //     const fromSpy = sandbox.spy(fromObj, "from");
    //     const whereSpy = sandbox.spy(whereObj, "where");

    //     const seasonsStub = sandbox.stub(pubg, "seasons").callsFake(() => {
    //         return Promise.resolve({
    //             type: "seasons",
    //             data: [
    //                 {
    //                     id: "some-season-id-1",
    //                     attributes: {
    //                         isCurrentSeason: false
    //                     }
    //                 },
    //                 {
    //                     id: "some-season-id-2",
    //                     attributes: {
    //                         isCurrentSeason: false
    //                     }
    //                 },
    //                 {
    //                     id: "some-season-id-3",
    //                     attributes: {
    //                         isCurrentSeason: true
    //                     }
    //                 }
    //             ]
    //         });
    //     });

    //     const playerStatsStub = sandbox.stub(pubg, "playerStats").callsFake((pubgId, seasonId) => {
    //         return Promise.resolve({
    //             type: "stats",
    //             data: {
    //                 attributes: {
    //                     gameModeStats: {
    //                         solo: {
    //                             kills: 1,
    //                             assists: 2,
    //                             damageDealt: 123.12,
    //                             wins: 1,
    //                             winPoints: 1337,
    //                             roundsPlayed: 321
    //                         }
    //                     }
    //                 }
    //             }
    //         })
    //     });

    //     const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

    //     return handlePromise.then(() => {

    //         sandbox.assert.calledOnce(selectSpy);
    //         sandbox.assert.calledOnce(fromSpy);
    //         sandbox.assert.calledOnce(whereSpy);

    //         expect(passedTableName).to.be.equal(db.TABLES.registeredPlayer);
    //         expect(passedWhereMapping.discord_id).to.be.equal(cmd.discordUser.id);
    //     });
    // });

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

    it('should return return the stats for all game modes if no argument was passed to cmd', () => {
        
        const cmdHandler = StatsCommandHandler.getHandler();

        let tableName = '';
        let whereMapping = {};

        const pubgPlayerId = "some-player-id";
        const pubgPlayerName = "some-pubg-name";
        const activeSeasonId = "some-season-id";

        let passedPubgPlayerId = '';
        let passedSeasonId = '';

        let passedChannelId = '';
        let passedBotMessage = '';

        const stats = {
            solo: {
                kills: 2,
                assists: 1,
                damageDealt: 100.0,
                wins: 1,
                winPoints: 1500,
                roundsPlayed: 1
            },
            squad: {
                kills: 2,
                assists: 1,
                damageDealt: 100.0,
                wins: 0,
                winPoints: 1500,
                roundsPlayed: 1
            }
        };

        const cmd = {
            discordUser: {
                id: "some-discord-id",
                channelId: "123"
            },
            arguments: []
        };
        const bot = {
            sendMessage: function(params) {
                passedChannelId = params.to;
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
                                    return Promise.resolve([
                                        {
                                            pubg_id: pubgPlayerId,
                                            pubg_name: pubgPlayerName
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
                        gameModeStats: stats
                    }
                }
            })
        });

        const sendMessageSpy = sandbox.spy(bot, "sendMessage");

        const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

        return handlePromise.then(() => {
            
            sandbox.assert.calledOnce(sendMessageSpy);

            expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);

            expect(passedBotMessage).to.contain('all');
            expect(passedBotMessage).to.contain(pubgPlayerName);

            expect(passedBotMessage).to.contain('Kills');
            expect(passedBotMessage).to.contain(stats.solo.kills + stats.squad.kills);
            expect(passedBotMessage).to.contain((stats.solo.kills + stats.squad.kills) / (stats.solo.roundsPlayed + stats.squad.roundsPlayed));

            expect(passedBotMessage).to.contain('Assists');
            expect(passedBotMessage).to.contain(stats.solo.assists + stats.squad.assists);
            expect(passedBotMessage).to.contain((stats.solo.assists + stats.squad.assists) / (stats.solo.roundsPlayed + stats.squad.roundsPlayed));

            expect(passedBotMessage).to.contain('Wins');
            expect(passedBotMessage).to.contain(stats.solo.wins + stats.squad.wins);
            expect(passedBotMessage).to.contain((stats.solo.wins + stats.squad.wins) / (stats.solo.roundsPlayed + stats.squad.roundsPlayed));
        });
    });

    it('should return avg. stats for game mode "solo" when passed as argument', () => {
        
        const cmdHandler = StatsCommandHandler.getHandler();

        let tableName = '';
        let whereMapping = {};

        const pubgPlayerId = "some-player-id";
        const pubgPlayerName = "some-pubg-name";
        const activeSeasonId = "some-season-id";

        let passedPubgPlayerId = '';
        let passedSeasonId = '';

        let passedChannelId = '';
        let passedBotMessage = '';

        const stats = {
            solo: {
                kills: 2,
                assists: 1,
                damageDealt: 100.0,
                wins: 1,
                winPoints: 1500,
                roundsPlayed: 1
            },
            duo: {
                kills: 3,
                assists: 4,
                damageDealt: 400.0,
                wins: 0,
                winPoints: 1500,
                roundsPlayed: 123
            },
            squad: {
                kills: 5,
                assists: 6,
                damageDealt: 3200.0,
                wins: 0,
                winPoints: 1500,
                roundsPlayed: 321
            }
        };

        const cmd = {
            discordUser: {
                id: "some-discord-id",
                channelId: "123"
            },
            arguments: [
                "solo" // <--
            ]
        };
        const bot = {
            sendMessage: function(params) {
                passedChannelId = params.to;
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
                                    return Promise.resolve([
                                        {
                                            pubg_id: pubgPlayerId,
                                            pubg_name: pubgPlayerName
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
                        gameModeStats: stats
                    }
                }
            })
        });

        const sendMessageSpy = sandbox.spy(bot, "sendMessage");

        const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

        return handlePromise.then(() => {
            
            sandbox.assert.calledOnce(sendMessageSpy);

            expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);

            expect(passedBotMessage).to.contain('solo');
            expect(passedBotMessage).to.contain(pubgPlayerName);

            expect(passedBotMessage).to.contain('Kills');
            expect(passedBotMessage).to.contain(stats.solo.kills);
            expect(passedBotMessage).to.contain((stats.solo.kills) / (stats.solo.roundsPlayed));

            expect(passedBotMessage).to.contain('Assists');
            expect(passedBotMessage).to.contain(stats.solo.assists);
            expect(passedBotMessage).to.contain((stats.solo.assists) / (stats.solo.roundsPlayed));

            expect(passedBotMessage).to.contain('Wins');
            expect(passedBotMessage).to.contain(stats.solo.wins);
            expect(passedBotMessage).to.contain((stats.solo.wins) / (stats.solo.roundsPlayed));
        });
    });

    it('should return avg. stats for game mode "solo-fpp" when passed as argument', () => {
        
        const cmdHandler = StatsCommandHandler.getHandler();

        let tableName = '';
        let whereMapping = {};

        const pubgPlayerId = "some-player-id";
        const pubgPlayerName = "some-pubg-name";
        const activeSeasonId = "some-season-id";

        let passedPubgPlayerId = '';
        let passedSeasonId = '';

        let passedChannelId = '';
        let passedBotMessage = '';

        const stats = {
            solo: {
                kills: 7,
                assists: 8,
                damageDealt: 4300.0,
                wins: 0,
                winPoints: 1500,
                roundsPlayed: 432
            },
            "solo-fpp": {
                kills: 2,
                assists: 1,
                damageDealt: 100.0,
                wins: 1,
                winPoints: 1500,
                roundsPlayed: 1
            },
            duo: {
                kills: 3,
                assists: 4,
                damageDealt: 400.0,
                wins: 0,
                winPoints: 1500,
                roundsPlayed: 123
            },
            squad: {
                kills: 5,
                assists: 6,
                damageDealt: 3200.0,
                wins: 0,
                winPoints: 1500,
                roundsPlayed: 321
            }
        };

        const cmd = {
            discordUser: {
                id: "some-discord-id",
                channelId: "123"
            },
            arguments: [
                "solo-fpp" // <--
            ]
        };
        const bot = {
            sendMessage: function(params) {
                passedChannelId = params.to;
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
                                    return Promise.resolve([
                                        {
                                            pubg_id: pubgPlayerId,
                                            pubg_name: pubgPlayerName
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
                        gameModeStats: stats
                    }
                }
            })
        });

        const sendMessageSpy = sandbox.spy(bot, "sendMessage");

        const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

        return handlePromise.then(() => {
            
            sandbox.assert.calledOnce(sendMessageSpy);

            expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);

            expect(passedBotMessage).to.contain('solo-fpp');
            expect(passedBotMessage).to.contain(pubgPlayerName);

            expect(passedBotMessage).to.contain('Kills');
            expect(passedBotMessage).to.contain(stats["solo-fpp"].kills);
            expect(passedBotMessage).to.contain((stats["solo-fpp"].kills) / (stats["solo-fpp"].roundsPlayed));

            expect(passedBotMessage).to.contain('Assists');
            expect(passedBotMessage).to.contain(stats["solo-fpp"].assists);
            expect(passedBotMessage).to.contain((stats["solo-fpp"].assists) / (stats["solo-fpp"].roundsPlayed));

            expect(passedBotMessage).to.contain('Wins');
            expect(passedBotMessage).to.contain(stats["solo-fpp"].wins);
            expect(passedBotMessage).to.contain((stats["solo-fpp"].wins) / (stats["solo-fpp"].roundsPlayed));
        });
    });

    it('should return avg. stats for game mode "duo" when passed as argument', () => {
        
        const cmdHandler = StatsCommandHandler.getHandler();

        let tableName = '';
        let whereMapping = {};

        const pubgPlayerId = "some-player-id";
        const pubgPlayerName = "some-pubg-name";
        const activeSeasonId = "some-season-id";

        let passedPubgPlayerId = '';
        let passedSeasonId = '';

        let passedChannelId = '';
        let passedBotMessage = '';

        const stats = {
            solo: {
                kills: 7,
                assists: 8,
                damageDealt: 4300.0,
                wins: 0,
                winPoints: 1500,
                roundsPlayed: 432
            },
            "solo-fpp": {
                kills: 2,
                assists: 1,
                damageDealt: 100.0,
                wins: 1,
                winPoints: 1500,
                roundsPlayed: 1
            },
            duo: {
                kills: 20,
                assists: 10,
                damageDealt: 400.0,
                wins: 0,
                winPoints: 1500,
                roundsPlayed: 10
            },
            squad: {
                kills: 5,
                assists: 6,
                damageDealt: 3200.0,
                wins: 0,
                winPoints: 1500,
                roundsPlayed: 321
            }
        };

        const cmd = {
            discordUser: {
                id: "some-discord-id",
                channelId: "123"
            },
            arguments: [
                "duo" // <--
            ]
        };
        const bot = {
            sendMessage: function(params) {
                passedChannelId = params.to;
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
                                    return Promise.resolve([
                                        {
                                            pubg_id: pubgPlayerId,
                                            pubg_name: pubgPlayerName
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
                        gameModeStats: stats
                    }
                }
            })
        });

        const sendMessageSpy = sandbox.spy(bot, "sendMessage");

        const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

        return handlePromise.then(() => {
            
            sandbox.assert.calledOnce(sendMessageSpy);

            expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);

            expect(passedBotMessage).to.contain('duo');
            expect(passedBotMessage).to.contain(pubgPlayerName);

            expect(passedBotMessage).to.contain('Kills');
            expect(passedBotMessage).to.contain(stats["duo"].kills);
            expect(passedBotMessage).to.contain((stats["duo"].kills) / (stats["duo"].roundsPlayed));

            expect(passedBotMessage).to.contain('Assists');
            expect(passedBotMessage).to.contain(stats["duo"].assists);
            expect(passedBotMessage).to.contain((stats["duo"].assists) / (stats["duo"].roundsPlayed));

            expect(passedBotMessage).to.contain('Wins');
            expect(passedBotMessage).to.contain(stats["duo"].wins);
            expect(passedBotMessage).to.contain((stats["duo"].wins) / (stats["duo"].roundsPlayed));
        });
    });

    it('should return avg. stats for game mode "duo-fpp" when passed as argument', () => {
        
        const cmdHandler = StatsCommandHandler.getHandler();

        let tableName = '';
        let whereMapping = {};

        const pubgPlayerId = "some-player-id";
        const pubgPlayerName = "some-pubg-name";
        const activeSeasonId = "some-season-id";

        let passedPubgPlayerId = '';
        let passedSeasonId = '';

        let passedChannelId = '';
        let passedBotMessage = '';

        const stats = {
            solo: {
                kills: 7,
                assists: 8,
                damageDealt: 4300.0,
                wins: 0,
                winPoints: 1500,
                roundsPlayed: 432
            },
            "duo-fpp": {
                kills: 2,
                assists: 1,
                damageDealt: 100.0,
                wins: 1,
                winPoints: 1500,
                roundsPlayed: 1
            },
            duo: {
                kills: 3,
                assists: 4,
                damageDealt: 400.0,
                wins: 0,
                winPoints: 1500,
                roundsPlayed: 123
            },
            squad: {
                kills: 5,
                assists: 6,
                damageDealt: 3200.0,
                wins: 0,
                winPoints: 1500,
                roundsPlayed: 321
            }
        };

        const cmd = {
            discordUser: {
                id: "some-discord-id",
                channelId: "123"
            },
            arguments: [
                "duo-fpp" // <--
            ]
        };
        const bot = {
            sendMessage: function(params) {
                passedChannelId = params.to;
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
                                    return Promise.resolve([
                                        {
                                            pubg_id: pubgPlayerId,
                                            pubg_name: pubgPlayerName
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
                        gameModeStats: stats
                    }
                }
            })
        });

        const sendMessageSpy = sandbox.spy(bot, "sendMessage");

        const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

        return handlePromise.then(() => {
            
            sandbox.assert.calledOnce(sendMessageSpy);

            expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);

            expect(passedBotMessage).to.contain('duo-fpp');
            expect(passedBotMessage).to.contain(pubgPlayerName);

            expect(passedBotMessage).to.contain('Kills');
            expect(passedBotMessage).to.contain(stats["duo-fpp"].kills);
            expect(passedBotMessage).to.contain((stats["duo-fpp"].kills) / (stats["duo-fpp"].roundsPlayed));

            expect(passedBotMessage).to.contain('Assists');
            expect(passedBotMessage).to.contain(stats["duo-fpp"].assists);
            expect(passedBotMessage).to.contain((stats["duo-fpp"].assists) / (stats["duo-fpp"].roundsPlayed));

            expect(passedBotMessage).to.contain('Wins');
            expect(passedBotMessage).to.contain(stats["duo-fpp"].wins);
            expect(passedBotMessage).to.contain((stats["duo-fpp"].wins) / (stats["duo-fpp"].roundsPlayed));
        });
    });

    it('should return avg. stats for game mode "squad" when passed as argument', () => {
        
        const cmdHandler = StatsCommandHandler.getHandler();

        let tableName = '';
        let whereMapping = {};

        const pubgPlayerId = "some-player-id";
        const pubgPlayerName = "some-pubg-name";
        const activeSeasonId = "some-season-id";

        let passedPubgPlayerId = '';
        let passedSeasonId = '';

        let passedChannelId = '';
        let passedBotMessage = '';

        const stats = {
            solo: {
                kills: 7,
                assists: 8,
                damageDealt: 4300.0,
                wins: 0,
                winPoints: 1500,
                roundsPlayed: 432
            },
            "solo-fpp": {
                kills: 2,
                assists: 1,
                damageDealt: 100.0,
                wins: 1,
                winPoints: 1500,
                roundsPlayed: 1
            },
            duo: {
                kills: 3,
                assists: 4,
                damageDealt: 400.0,
                wins: 0,
                winPoints: 1500,
                roundsPlayed: 123
            },
            squad: {
                kills: 30,
                assists: 15,
                damageDealt: 3200.0,
                wins: 0,
                winPoints: 1500,
                roundsPlayed: 10
            }
        };

        const cmd = {
            discordUser: {
                id: "some-discord-id",
                channelId: "123"
            },
            arguments: [
                "squad" // <--
            ]
        };
        const bot = {
            sendMessage: function(params) {
                passedChannelId = params.to;
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
                                    return Promise.resolve([
                                        {
                                            pubg_id: pubgPlayerId,
                                            pubg_name: pubgPlayerName
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
                        gameModeStats: stats
                    }
                }
            })
        });

        const sendMessageSpy = sandbox.spy(bot, "sendMessage");

        const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

        return handlePromise.then(() => {
            
            sandbox.assert.calledOnce(sendMessageSpy);

            expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);

            expect(passedBotMessage).to.contain('squad');
            expect(passedBotMessage).to.contain(pubgPlayerName);

            expect(passedBotMessage).to.contain('Kills');
            expect(passedBotMessage).to.contain(stats["squad"].kills);
            expect(passedBotMessage).to.contain((stats["squad"].kills) / (stats["squad"].roundsPlayed));

            expect(passedBotMessage).to.contain('Assists');
            expect(passedBotMessage).to.contain(stats["squad"].assists);
            expect(passedBotMessage).to.contain((stats["squad"].assists) / (stats["squad"].roundsPlayed));

            expect(passedBotMessage).to.contain('Wins');
            expect(passedBotMessage).to.contain(stats["squad"].wins);
            expect(passedBotMessage).to.contain((stats["squad"].wins) / (stats["squad"].roundsPlayed));
        });
    });

    it('should return avg. stats for game mode "squad-fpp" when passed as argument', () => {
        
        const cmdHandler = StatsCommandHandler.getHandler();

        let tableName = '';
        let whereMapping = {};

        const pubgPlayerId = "some-player-id";
        const pubgPlayerName = "some-pubg-name";
        const activeSeasonId = "some-season-id";

        let passedPubgPlayerId = '';
        let passedSeasonId = '';

        let passedChannelId = '';
        let passedBotMessage = '';

        const stats = {
            solo: {
                kills: 7,
                assists: 8,
                damageDealt: 4300.0,
                wins: 0,
                winPoints: 1500,
                roundsPlayed: 432
            },
            "squad-fpp": {
                kills: 2,
                assists: 1,
                damageDealt: 100.0,
                wins: 1,
                winPoints: 1500,
                roundsPlayed: 1
            },
            duo: {
                kills: 3,
                assists: 4,
                damageDealt: 400.0,
                wins: 0,
                winPoints: 1500,
                roundsPlayed: 123
            },
            squad: {
                kills: 5,
                assists: 6,
                damageDealt: 3200.0,
                wins: 0,
                winPoints: 1500,
                roundsPlayed: 321
            }
        };

        const cmd = {
            discordUser: {
                id: "some-discord-id",
                channelId: "123"
            },
            arguments: [
                "squad-fpp" // <--
            ]
        };
        const bot = {
            sendMessage: function(params) {
                passedChannelId = params.to;
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
                                    return Promise.resolve([
                                        {
                                            pubg_id: pubgPlayerId,
                                            pubg_name: pubgPlayerName
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
                        gameModeStats: stats
                    }
                }
            })
        });

        const sendMessageSpy = sandbox.spy(bot, "sendMessage");

        const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

        return handlePromise.then(() => {
            
            sandbox.assert.calledOnce(sendMessageSpy);

            expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);

            expect(passedBotMessage).to.contain('squad-fpp');
            expect(passedBotMessage).to.contain(pubgPlayerName);

            expect(passedBotMessage).to.contain('Kills');
            expect(passedBotMessage).to.contain(stats["squad-fpp"].kills);
            expect(passedBotMessage).to.contain((stats["squad-fpp"].kills) / (stats["squad-fpp"].roundsPlayed));

            expect(passedBotMessage).to.contain('Assists');
            expect(passedBotMessage).to.contain(stats["squad-fpp"].assists);
            expect(passedBotMessage).to.contain((stats["squad-fpp"].assists) / (stats["squad-fpp"].roundsPlayed));

            expect(passedBotMessage).to.contain('Wins');
            expect(passedBotMessage).to.contain(stats["squad-fpp"].wins);
            expect(passedBotMessage).to.contain((stats["squad-fpp"].wins) / (stats["squad-fpp"].roundsPlayed));
        });
    });

    it('should send an error error message if there is no player id for discord user in db', () => {
        
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

    it('should send an error message if multiple player ids are returned by db query', () => {
        
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
                                    return Promise.resolve([
                                        {
                                            pubg_id: "some-pubg-id1",
                                            pubg_name: "some-pubg-name1"
                                        },
                                        {
                                            pubg_id: "some-pubg-id2",
                                            pubg_name: "some-pubg-name2"
                                        }
                                    ]);
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

                expect(passedBotMessage).to.be.not.undefined;
                expect(passedBotMessage).to.be.not.null;
                expect(passedBotMessage.length).to.be.greaterThan(0);

                sandbox.assert.notCalled(seasonsStub);
                sandbox.assert.notCalled(playerStatsStub);
            });
    });

    it('should send an error message if an invalid argument was passed', () => {
        
        const cmdHandler = StatsCommandHandler.getHandler();

        let tableName = '';
        let whereMapping = {};

        let passedBotMessage = '';

        const cmd = {
            discordUser: {
                id: "some-discord-id",
                channelId: "123"
            },
            arguments: [
                "asd"
            ]
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
                                    return Promise.resolve([
                                        {
                                            pubg_id: "some-pubg-id1",
                                            pubg_name: "some-pubg-name1"
                                        }
                                    ]);
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

        return handlePromise.then(() => {

            sandbox.assert.calledOnce(sendMessageSpy);

            expect(passedBotMessage).to.contain('invalid game mode "asd"')
        });
    });

    it('should send an error message if multiple arguments were passed', () => {
        
        const cmdHandler = StatsCommandHandler.getHandler();

        let tableName = '';
        let whereMapping = {};

        let passedBotMessage = '';

        const cmd = {
            discordUser: {
                id: "some-discord-id",
                channelId: "123"
            },
            arguments: [
                "solo",
                "squad-fpp"
            ]
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
                                    return Promise.resolve([
                                        {
                                            pubg_id: "some-pubg-id1",
                                            pubg_name: "some-pubg-name1"
                                        }
                                    ]);
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

        return handlePromise.then(() => {

            sandbox.assert.calledOnce(sendMessageSpy);
            expect(passedBotMessage).to.contain('invalid amount of arguments')
        });
    });
});