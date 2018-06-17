const assert = require('chai').assert;
const expect = require('chai').expect;
const sinon = require('sinon');

const logger = require('../../../../src/modules/log').getLogger();

const RegisterCommandHandler = require('../../../../src/modules/cmd/command-handler/register-cmd-handler');


describe('RegisterCommandHandler', () => {

    let sandbox = {};

    let debugStub = {};
    let infoStub = {};
    let warnStub = {};
    let errorStub = {};

    let cmd = {};

    let bot = {};
    let passedChannelId = '';
    let passedBotMessage = '';

    let db = {};

    let passedPlayerName = '';
    let playerByNameData = {};
    let pubg = {};

    let sendMessageSpy = {};
    let playerByNameSpy = {};

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
            sendMessage: function(params) {
                passedChannelId = params.to;
                passedBotMessage = params.message;
            }
        };

        db = {
            getRegions: function(where) {
                return Promise.resolve([
                    {
                        id: 1,
                        region_name: "some-region-name"
                    }
                ])
            },
            getRegisteredPlayers: function(where) {
                return Promise.resolve([])
            },
            insertRegisteredPlayer: function(player) {
                return Promise.resolve(1);
            }
        }
        
        playerByNameData = {
            data: [
                {
                    id: "some-pubg-id",
                    attributes: {
                        name: "some-pubg-name"
                    }
                }
            ]
        };
        pubg = {
            playerByName: function(name) {
                passedPlayerName = name;
                return Promise.resolve(playerByNameData);
            }
        };

        sendMessageSpy = sandbox.spy(bot, "sendMessage");
        playerByNameSpy = sandbox.spy(pubg, "playerByName");
    });

    afterEach(() => {       
        sandbox.restore();
    });


    describe('handle()', () => {

        // ----------------------------------------------------------------------------------------
        // Unit Tests
        // ----------------------------------------------------------------------------------------

        it('should call the pubg api for the player id with the given argument', () => {
            
            const handler = RegisterCommandHandler.getHandler();

            cmd.arguments = [
                "to-register-pubg-name"
            ]
            
            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {
                sandbox.assert.calledOnce(playerByNameSpy);
                sandbox.assert.calledWith(playerByNameSpy, cmd.arguments[0])
            });
        });

        it('should query the db for registered players', () => {

            const handler = RegisterCommandHandler.getHandler();

            cmd.arguments = [
                "to-register-pubg-name"
            ]
            
            let getPlayerSpy = sandbox.spy(db, "getRegisteredPlayers");

            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {
                sandbox.assert.calledOnce(getPlayerSpy);
                expect(getPlayerSpy.getCall(0).args[0].discord_id).to.be.equal(cmd.discordUser.id);
            })
        });

        it('should query the database for the global region if only a single argument was given', () => {

            const handler = RegisterCommandHandler.getHandler();

            cmd.arguments = [
                "to-register-pubg-name"
            ]
            
            let getRegionsSpy = sandbox.spy(db, "getRegions");

            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {
                sandbox.assert.calledOnce(getRegionsSpy);
                expect(getRegionsSpy.getCall(0).args[0].is_global_region).to.be.equal(true);
            })
        });

        it('should create an database entry if player id does not exist yet', () => {
            
            const handler = RegisterCommandHandler.getHandler();

            cmd.arguments = [
                "to-register-pubg-name"
            ];

            let insertPlayerSpy = sandbox.spy(db, "insertRegisteredPlayer")

            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {
                sandbox.assert.calledOnce(insertPlayerSpy);

                expect(insertPlayerSpy.getCall(0).args[0].discord_id).to.be.equal(cmd.discordUser.id);
                expect(insertPlayerSpy.getCall(0).args[0].discord_name).to.be.equal(cmd.discordUser.name);
                expect(insertPlayerSpy.getCall(0).args[0].pubg_id).to.be.equal(playerByNameData.data[0].id);
                expect(insertPlayerSpy.getCall(0).args[0].pubg_name).to.be.equal(playerByNameData.data[0].attributes.name);
            })
        });

        it('should send an success message if player was succesfully registered', () => {
            
            const handler = RegisterCommandHandler.getHandler();

            cmd.arguments = [
                "to-register-pubg-name"
            ];

            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {
                sandbox.assert.calledOnce(sendMessageSpy);

                expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);
                expect(passedBotMessage).to.contain(playerByNameData.data[0].attributes.name);
                expect(passedBotMessage).to.contain("successfully registered");
            });
        });  

        it('should send an error message if the pubg api request fails', () => {

            const handler = RegisterCommandHandler.getHandler();

            cmd.arguments = [
                "to-register-pubg-name"
            ];

            pubg.playerByName = function(args) {
                return Promise.reject(new Error("whatever"));
            };

            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {
                sandbox.assert.calledOnce(sendMessageSpy);

                expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);
                expect(passedBotMessage).to.contain("whatever");
            });
        });
        
        it('should send an error message if there already exists an entry for the player', () => {
            
            const handler = RegisterCommandHandler.getHandler();

            cmd.arguments = [
                "to-register-pubg-name"
            ];

            sandbox.stub(db, "getRegisteredPlayers").callsFake((args) => {
                return Promise.resolve(["some-already-existing-player-name"]);
            });

            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {
                sinon.assert.calledOnce(sendMessageSpy);

                expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);
                expect(passedBotMessage).to.contain("already is a player name registered for your discord user");
            });
        });

        it('should query the database for the region given by the second argument', () => {
            
            const handler = RegisterCommandHandler.getHandler();

            cmd.arguments = [
                "to-register-pubg-name",
                "pc-na"
            ]
            
            let getRegionsSpy = sandbox.spy(db, "getRegions");

            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {
                sandbox.assert.calledOnce(getRegionsSpy);
                expect(getRegionsSpy.getCall(0).args[0].region_name).to.be.equal("pc-na");
            })
        });

        it('should send an eror message if no argument was given', () => {
            
            const handler = RegisterCommandHandler.getHandler();

            cmd.arguments = [
                // no  arguments
            ];

            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {
                sinon.assert.calledOnce(sendMessageSpy);

                expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);
                expect(passedBotMessage).to.contain("invalid amount of arguments");
            });
        });

        it('should send an error message if the second argument is an invalid region', () => {
            const handler = RegisterCommandHandler.getHandler();

            cmd.arguments = [
                "to-register-player-name",
                "xbox-invalid"
            ];

            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {
                sinon.assert.calledOnce(sendMessageSpy);

                expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);
                expect(passedBotMessage).to.contain("unknown region");
                expect(passedBotMessage).to.contain("xbox-invalid");
            });
        });

        it('should send an error message if more than two arguments were given', () => {
            
            const handler = RegisterCommandHandler.getHandler();

            cmd.arguments = [
                "to-register-pubg-name-1",
                "pc-eu",
                "some-third-argument"
            ];

            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {
                sinon.assert.calledOnce(sendMessageSpy);

                expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);
                expect(passedBotMessage).to.contain("invalid amount of arguments");
            });
        });
    });
});