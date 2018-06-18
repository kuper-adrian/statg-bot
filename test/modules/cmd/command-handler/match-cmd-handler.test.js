const expect = require('chai').expect;
const sinon = require('sinon');

const logger = require('../../../../src/modules/log').getLogger();
const MatchCommandHandler = require('../../../../src/modules/cmd/command-handler/match-cmd-handler');

describe('MatchCommandHandler', () => {

    let sandbox;

    let cmd = {};
    let bot = {};
    let db = {};
    let pubg = {};

    let passedChannelId = '';
    let passedBotMessage = '';

    let sendMessageSpy = {};

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

        cmd = {
            discordUser: {
                id: "some-discord-id",
                channelId: "123"
            },
            arguments: []
        };

        bot = {
            sendMessage: function (params) {
                passedChannelId = params.to;
                passedBotMessage = params.message;
            }
        };

        db = {
            getRegisteredPlayers: function (where) {
                return Promise.resolve([]);
            },
            getRegions: function (where) {
                return Promise.resolve([]);
            }
        }

        pubg = {
            playerById: function (pubgId, region) {
                return Promise.resolve({});
            },
            matchById: function (matchId, region) {
                return Promise.resolve({});
            }
        }

        sendMessageSpy = sandbox.spy(bot, "sendMessage");
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('handle()', () => {

        it('should query the database for the player', () => {

            const cmdHandler = MatchCommandHandler.getHandler();

            const getPlayersStub = sandbox.stub(db, "getRegisteredPlayers").callsFake((where) => {
                return Promise.resolve([
                    {
                        pubg_id: "some-pubg-id",
                        pubg_name: "some-pubg-name"
                    }
                ]);
            });

            const getRegionsStub = sandbox.stub(db, "getRegions").callsFake(where => {
                return Promise.resolve([
                    {
                        id: 1,
                        region_name: "some-region-name"
                    }
                ]);
            });

            const playerByIdStub = sandbox.stub(pubg, "playerById").callsFake((pubgId, region) => {
                return Promise.resolve({
                    data: {
                        relationships: {
                            matches: {
                                data: [
                                    {
                                        type: "match",
                                        id: "some-match-id-1"
                                    },
                                    {
                                        type: "match",
                                        id: "some-match-id-2"
                                    }
                                ]
                            }
                        }
                    }
                });
            });

            const matchByIdStub = sandbox.stub(pubg, "matchById").callsFake((matchId, region) => {
                return Promise.resolve(STUB_MATCH_DATA);
            });

            const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {

                sandbox.assert.calledOnce(getPlayersStub);
                expect(cmd.discordUser.id).to.be.equal(getPlayersStub.getCall(0).args[0].discord_id);
            });
        });

        it('should query the database for the region name of the player', () => {

            const cmdHandler = MatchCommandHandler.getHandler();

            const regionId = 42;

            const getPlayersStub = sandbox.stub(db, "getRegisteredPlayers").callsFake((where) => {
                return Promise.resolve([
                    {
                        pubg_id: "some-pubg-id",
                        pubg_name: "some-pubg-name",
                        region_id: regionId
                    }
                ]);
            });

            const getRegionsStub = sandbox.stub(db, "getRegions").callsFake(where => {
                return Promise.resolve([
                    {
                        id: 1,
                        region_name: "some-region-name"
                    }
                ]);
            });

            const playerByIdStub = sandbox.stub(pubg, "playerById").callsFake((pubgId, region) => {
                return Promise.resolve({
                    data: {
                        relationships: {
                            matches: {
                                data: [
                                    {
                                        type: "match",
                                        id: "some-match-id-1"
                                    },
                                    {
                                        type: "match",
                                        id: "some-match-id-2"
                                    }
                                ]
                            }
                        }
                    }
                });
            });

            const matchByIdStub = sandbox.stub(pubg, "matchById").callsFake((matchId, region) => {
                return Promise.resolve(STUB_MATCH_DATA);
            });

            const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {

                sandbox.assert.calledOnce(getRegionsStub);
                expect(regionId).to.be.equal(getRegionsStub.getCall(0).args[0].id);
            });
        });

        it('should send an api request for the player', () => {

            const cmdHandler = MatchCommandHandler.getHandler();

            const pubgId = "some-pubg-id";
            const regionName = "some-region-name"

            const getPlayersStub = sandbox.stub(db, "getRegisteredPlayers").callsFake((where) => {
                return Promise.resolve([
                    {
                        pubg_id: pubgId,
                        pubg_name: "some-pubg-name"
                    }
                ]);
            });

            const getRegionsStub = sandbox.stub(db, "getRegions").callsFake(where => {
                return Promise.resolve([
                    {
                        id: 1,
                        region_name: regionName
                    }
                ]);
            });

            const playerByIdStub = sandbox.stub(pubg, "playerById").callsFake((pubgId, region) => {
                return Promise.resolve({
                    data: {
                        relationships: {
                            matches: {
                                data: [
                                    {
                                        type: "match",
                                        id: "some-match-id-1"
                                    },
                                    {
                                        type: "match",
                                        id: "some-match-id-2"
                                    }
                                ]
                            }
                        }
                    }
                });
            });

            const matchByIdStub = sandbox.stub(pubg, "matchById").callsFake((matchId, region) => {
                return Promise.resolve(STUB_MATCH_DATA);
            });

            const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {

                sandbox.assert.calledOnce(playerByIdStub);
                expect(pubgId).to.be.equal(playerByIdStub.getCall(0).args[0]);
                expect(regionName).to.be.equal(playerByIdStub.getCall(0).args[1]);
            });
        });

        it('should send an api request for the match', () => {
            
            const cmdHandler = MatchCommandHandler.getHandler();

            const matchId = "some-match-id";
            const regionName = "some-region-name"

            const getPlayersStub = sandbox.stub(db, "getRegisteredPlayers").callsFake((where) => {
                return Promise.resolve([
                    {
                        pubg_id: "some-pubg-id",
                        pubg_name: "some-pubg-name"
                    }
                ]);
            });

            const getRegionsStub = sandbox.stub(db, "getRegions").callsFake(where => {
                return Promise.resolve([
                    {
                        id: 1,
                        region_name: regionName
                    }
                ]);
            });

            const playerByIdStub = sandbox.stub(pubg, "playerById").callsFake((pubgId, region) => {
                return Promise.resolve({
                    data: {
                        relationships: {
                            matches: {
                                data: [
                                    {
                                        type: "match",
                                        id: matchId
                                    },
                                    {
                                        type: "match",
                                        id: "some-match-id-2"
                                    }
                                ]
                            }
                        }
                    }
                });
            });

            const matchByIdStub = sandbox.stub(pubg, "matchById").callsFake((matchId, region) => {
                return Promise.resolve(STUB_MATCH_DATA);
            });

            const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {

                sandbox.assert.calledOnce(matchByIdStub);
                expect(matchId).to.be.equal(matchByIdStub.getCall(0).args[0]);
                expect(regionName).to.be.equal(matchByIdStub.getCall(0).args[1]);
            });
        });

        it('should send a message containing the match data', () => {
            
            
            const cmdHandler = MatchCommandHandler.getHandler();

            const getPlayersStub = sandbox.stub(db, "getRegisteredPlayers").callsFake((where) => {
                return Promise.resolve([
                    {
                        pubg_id: "some-pubg-id",
                        pubg_name: "some-pubg-name"
                    }
                ]);
            });

            const getRegionsStub = sandbox.stub(db, "getRegions").callsFake(where => {
                return Promise.resolve([
                    {
                        id: 1,
                        region_name: "some-region-name"
                    }
                ]);
            });

            const playerByIdStub = sandbox.stub(pubg, "playerById").callsFake((pubgId, region) => {
                return Promise.resolve({
                    data: {
                        relationships: {
                            matches: {
                                data: [
                                    {
                                        type: "match",
                                        id: "some-match-id-1"
                                    },
                                    {
                                        type: "match",
                                        id: "some-match-id-2"
                                    }
                                ]
                            }
                        }
                    }
                });
            });

            const matchByIdStub = sandbox.stub(pubg, "matchById").callsFake((matchId, region) => {
                return Promise.resolve(STUB_MATCH_DATA);
            });

            const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {

                sandbox.assert.calledOnce(sendMessageSpy);

                expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);

                expect(passedBotMessage).to.contain("squad-fpp");
                expect(passedBotMessage).to.contain("Desert_Main");
                expect(passedBotMessage).to.contain("some-dude-1");
                expect(passedBotMessage).to.contain("some-dude-2");
            });
        });

        it('should send an error message if player is not registered', () => {
            
            const cmdHandler = MatchCommandHandler.getHandler();

            const getPlayersStub = sandbox.stub(db, "getRegisteredPlayers").callsFake((where) => {
                return Promise.resolve([]); // <-- empty
            });

            const getRegionsStub = sandbox.stub(db, "getRegions").callsFake(where => {
                return Promise.resolve([
                    {
                        id: 1,
                        region_name: "some-region-name"
                    }
                ]);
            });

            const playerByIdStub = sandbox.stub(pubg, "playerById").callsFake((pubgId, region) => {
                return Promise.resolve({
                    data: {
                        relationships: {
                            matches: {
                                data: [
                                    {
                                        type: "match",
                                        id: "some-match-id-1"
                                    },
                                    {
                                        type: "match",
                                        id: "some-match-id-2"
                                    }
                                ]
                            }
                        }
                    }
                });
            });

            const matchByIdStub = sandbox.stub(pubg, "matchById").callsFake((matchId, region) => {
                return Promise.resolve(STUB_MATCH_DATA);
            });

            const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {

                sandbox.assert.calledOnce(sendMessageSpy);

                expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);

                expect(passedBotMessage).to.contain("Player not registered");
            });
        });

        it('should not send api request if player is not registered', () => {
            
            const cmdHandler = MatchCommandHandler.getHandler();

            const getPlayersStub = sandbox.stub(db, "getRegisteredPlayers").callsFake((where) => {
                return Promise.resolve([]); // <-- empty
            });

            const getRegionsStub = sandbox.stub(db, "getRegions").callsFake(where => {
                return Promise.resolve([
                    {
                        id: 1,
                        region_name: "some-region-name"
                    }
                ]);
            });

            const playerByIdStub = sandbox.stub(pubg, "playerById").callsFake((pubgId, region) => {
                return Promise.resolve({
                    data: {
                        relationships: {
                            matches: {
                                data: [
                                    {
                                        type: "match",
                                        id: "some-match-id-1"
                                    },
                                    {
                                        type: "match",
                                        id: "some-match-id-2"
                                    }
                                ]
                            }
                        }
                    }
                });
            });

            const matchByIdStub = sandbox.stub(pubg, "matchById").callsFake((matchId, region) => {
                return Promise.resolve(STUB_MATCH_DATA);
            });

            const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {

                sandbox.assert.notCalled(playerByIdStub);
                sandbox.assert.notCalled(matchByIdStub);
            });
        });

        it('should not query the database if arguments were passed', () => {
            
            const cmdHandler = MatchCommandHandler.getHandler();

            cmd.arguments = [
                "some-argument"
            ]

            const getPlayersStub = sandbox.stub(db, "getRegisteredPlayers").callsFake((where) => {
                return Promise.resolve([]); // <-- empty
            });

            const getRegionsStub = sandbox.stub(db, "getRegions").callsFake(where => {
                return Promise.resolve([
                    {
                        id: 1,
                        region_name: "some-region-name"
                    }
                ]);
            });

            const playerByIdStub = sandbox.stub(pubg, "playerById").callsFake((pubgId, region) => {
                return Promise.resolve({
                    data: {
                        relationships: {
                            matches: {
                                data: [
                                    {
                                        type: "match",
                                        id: "some-match-id-1"
                                    },
                                    {
                                        type: "match",
                                        id: "some-match-id-2"
                                    }
                                ]
                            }
                        }
                    }
                });
            });

            const matchByIdStub = sandbox.stub(pubg, "matchById").callsFake((matchId, region) => {
                return Promise.resolve(STUB_MATCH_DATA);
            });

            const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {

                sandbox.assert.notCalled(getPlayersStub);
                sandbox.assert.notCalled(getRegionsStub);
            });

        });

        it('should not send api request if arguments were passed', () => {
            
            const cmdHandler = MatchCommandHandler.getHandler();

            cmd.arguments = [
                "some-argument"
            ]

            const getPlayersStub = sandbox.stub(db, "getRegisteredPlayers").callsFake((where) => {
                return Promise.resolve([]); // <-- empty
            });

            const getRegionsStub = sandbox.stub(db, "getRegions").callsFake(where => {
                return Promise.resolve([
                    {
                        id: 1,
                        region_name: "some-region-name"
                    }
                ]);
            });

            const playerByIdStub = sandbox.stub(pubg, "playerById").callsFake((pubgId, region) => {
                return Promise.resolve({
                    data: {
                        relationships: {
                            matches: {
                                data: [
                                    {
                                        type: "match",
                                        id: "some-match-id-1"
                                    },
                                    {
                                        type: "match",
                                        id: "some-match-id-2"
                                    }
                                ]
                            }
                        }
                    }
                });
            });

            const matchByIdStub = sandbox.stub(pubg, "matchById").callsFake((matchId, region) => {
                return Promise.resolve(STUB_MATCH_DATA);
            });

            const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {

                sandbox.assert.notCalled(playerByIdStub);
                sandbox.assert.notCalled(matchByIdStub);
            });
        });

        it('should send an error message if an argument was passed', () => {
            
            const cmdHandler = MatchCommandHandler.getHandler();

            cmd.arguments = [
                "some-argument"
            ]

            const getPlayersStub = sandbox.stub(db, "getRegisteredPlayers").callsFake((where) => {
                return Promise.resolve([]); // <-- empty
            });

            const getRegionsStub = sandbox.stub(db, "getRegions").callsFake(where => {
                return Promise.resolve([
                    {
                        id: 1,
                        region_name: "some-region-name"
                    }
                ]);
            });

            const playerByIdStub = sandbox.stub(pubg, "playerById").callsFake((pubgId, region) => {
                return Promise.resolve({
                    data: {
                        relationships: {
                            matches: {
                                data: [
                                    {
                                        type: "match",
                                        id: "some-match-id-1"
                                    },
                                    {
                                        type: "match",
                                        id: "some-match-id-2"
                                    }
                                ]
                            }
                        }
                    }
                });
            });

            const matchByIdStub = sandbox.stub(pubg, "matchById").callsFake((matchId, region) => {
                return Promise.resolve(STUB_MATCH_DATA);
            });

            const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {

                sandbox.assert.calledOnce(sendMessageSpy);

                expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);
                expect(passedBotMessage).to.contain("invalid amount of arguments");
            });
        });

        it('should send an error message if multiple arguments were passed', () => {
            
            const cmdHandler = MatchCommandHandler.getHandler();

            cmd.arguments = [
                "some-argument",
                "some-other-argument",
                "yet-another-argument"
            ]

            const getPlayersStub = sandbox.stub(db, "getRegisteredPlayers").callsFake((where) => {
                return Promise.resolve([]); // <-- empty
            });

            const getRegionsStub = sandbox.stub(db, "getRegions").callsFake(where => {
                return Promise.resolve([
                    {
                        id: 1,
                        region_name: "some-region-name"
                    }
                ]);
            });

            const playerByIdStub = sandbox.stub(pubg, "playerById").callsFake((pubgId, region) => {
                return Promise.resolve({
                    data: {
                        relationships: {
                            matches: {
                                data: [
                                    {
                                        type: "match",
                                        id: "some-match-id-1"
                                    },
                                    {
                                        type: "match",
                                        id: "some-match-id-2"
                                    }
                                ]
                            }
                        }
                    }
                });
            });

            const matchByIdStub = sandbox.stub(pubg, "matchById").callsFake((matchId, region) => {
                return Promise.resolve(STUB_MATCH_DATA);
            });

            const handlePromise = cmdHandler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {

                sandbox.assert.calledOnce(sendMessageSpy);

                expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);
                expect(passedBotMessage).to.contain("invalid amount of arguments");
            });
        });
    });

    const STUB_MATCH_DATA = {
        "data": {
            "type": "match",
            "attributes": {
                "gameMode": "squad-fpp",
                "mapName": "Desert_Main",
                "isCustomMatch": false,
                "duration": 1864,
                "stats": null,
                "titleId": "bluehole-pubg",
                "shardId": "pc-eu",
                "createdAt": "2018-06-16T20:14:30Z"
            },
            "relationships": {
                "rosters": {
                    "data": [
                        {
                            "type": "roster",
                            "id": "ed255e88-2aab-477d-a043-0d798315230b"
                        }
                    ]
                }
            }
        },
        "included": [
            {
                "type": "participant",
                "id": "c2e20e56-ff63-4725-8d49-2af791407740",
                "attributes": {
                    "stats": {
                        "DBNOs": 1,
                        "assists": 0,
                        "boosts": 3,
                        "damageDealt": 151.659592,
                        "deathType": "byplayer",
                        "headshotKills": 0,
                        "heals": 3,
                        "killPlace": 11,
                        "killPoints": 1298,
                        "killPointsDelta": 18.4314747,
                        "killStreaks": 2,
                        "kills": 3,
                        "lastKillPoints": 0,
                        "lastWinPoints": 0,
                        "longestKill": 56,
                        "mostDamage": 0,
                        "name": "some-dude-1",
                        "playerId": "some-pubg-id",
                        "revives": 0,
                        "rideDistance": 1515.53674,
                        "roadKills": 0,
                        "swimDistance": 0,
                        "teamKills": 0,
                        "timeSurvived": 1072,
                        "vehicleDestroys": 0,
                        "walkDistance": 1641.45776,
                        "weaponsAcquired": 5,
                        "winPlace": 8,
                        "winPoints": 1433,
                        "winPointsDelta": 8.605656
                    }
                }
            },
            {
                "type": "participant",
                "id": "b3a4d5af-217b-4079-9624-c5209ef0c6de",
                "attributes": {
                    "stats": {
                        "DBNOs": 0,
                        "assists": 0,
                        "boosts": 0,
                        "damageDealt": 0,
                        "deathType": "byplayer",
                        "headshotKills": 0,
                        "heals": 0,
                        "killPlace": 54,
                        "killPoints": 1005,
                        "killPointsDelta": 5.490561,
                        "killStreaks": 0,
                        "kills": 0,
                        "lastKillPoints": 0,
                        "lastWinPoints": 0,
                        "longestKill": 0,
                        "mostDamage": 0,
                        "name": "some-dude-2",
                        "playerId": "some-pubg-id2",
                        "revives": 0,
                        "rideDistance": 0,
                        "roadKills": 0,
                        "swimDistance": 0,
                        "teamKills": 0,
                        "timeSurvived": 724,
                        "vehicleDestroys": 0,
                        "walkDistance": 2209.9082,
                        "weaponsAcquired": 10,
                        "winPlace": 16,
                        "winPoints": 1501,
                        "winPointsDelta": 1.31905639
                    },
                    "actor": "",
                    "shardId": "pc-eu"
                }
            },
            {
                "type": "roster",
                "id": "ed255e88-2aab-477d-a043-0d798315230b",
                "attributes": {
                    "stats": {
                        "rank": 1,
                        "teamId": 10
                    },
                    "won": "true"
                },
                "relationships": {
                    "team": {
                        "data": null
                    },
                    "participants": {
                        "data": [
                            {
                                "type": "participant",
                                "id": "c2e20e56-ff63-4725-8d49-2af791407740"
                            },
                            {
                                "type": "participant",
                                "id": "b3a4d5af-217b-4079-9624-c5209ef0c6de"
                            }
                        ]
                    }
                }
            }
        ]
    };
});