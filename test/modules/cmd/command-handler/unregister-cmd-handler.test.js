const expect = require('chai').expect;
const sinon = require('sinon');

const logger = require('../../../../src/modules/log').getLogger();
const UnregisterCommandHandler = require('../../../../src/modules/cmd/command-handler/unregister-cmd-handler');

describe('UnregisterCommandHandler', () => {

    let sandbox = {};

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
            sendMessage: function(params) {
                passedChannelId = params.to;
                passedBotMessage = params.message;
            }
        };

        db = {
            getRegisteredPlayers: function(where) {
                return Promise.resolve([]);
            },
            deleteRegisteredPlayers: function(where) {
                return Promise.resolve(1);
            }
        }

        sendMessageSpy = sandbox.spy(bot, "sendMessage");
    });

    afterEach(() => {

        sandbox.restore();
    });


    // ----------------------------------------------------------------------------------------
    // Unit Tests
    // ----------------------------------------------------------------------------------------

    describe('handle()', () => {

        it('should send an success message if user was successfully unregistered', () => {

            const handler = UnregisterCommandHandler.getHandler();

            let getRegisteredPlayersStub = sandbox.stub(db, "getRegisteredPlayers").callsFake((args) => {
                return Promise.resolve([
                    {
                        discord_id: 1,
                        discord_name: "some-discord-name",
                        pubg_id: 42,
                        pubg_name: "some-pubg-name"
                    }
                ]);
            });

            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {              
                sandbox.assert.calledOnce(sendMessageSpy);
                
                expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);
                expect(passedBotMessage).to.contain("some-pubg-name");
                expect(passedBotMessage).to.contain("successfully unregistered");
            });
        });

        it('should query the database for the discord user', () => {

            const handler = UnregisterCommandHandler.getHandler();

            const getRegisteredPlayersSpy = sandbox.spy(db, "getRegisteredPlayers");

            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {
                sandbox.assert.calledOnce(getRegisteredPlayersSpy);
                expect(getRegisteredPlayersSpy.getCall(0).args[0].discord_id).to.be.equal(cmd.discordUser.id);
            });
        });

        it('should execute the delete statement if user is registered', () => {

            const handler = UnregisterCommandHandler.getHandler();

            const deleteSpy = sandbox.spy(db, "deleteRegisteredPlayers");

            const getRegisteredPlayersStub = sandbox.stub(db, "getRegisteredPlayers").callsFake((args) => {
                return Promise.resolve([
                    {
                        discord_id: 1,
                        discord_name: "some-discord-name",
                        pubg_id: 42,
                        pubg_name: "some-pubg-name"
                    }
                ]);
            });

            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {              
                sandbox.assert.calledOnce(deleteSpy);

                expect(getRegisteredPlayersStub.getCall(0).args[0].discord_id).to.be.equal(cmd.discordUser.id);
            });
        });

        it('should not execute a delete statement if user is not registered', () => {
            
            const handler = UnregisterCommandHandler.getHandler();

            const deleteSpy = sandbox.spy(db, "deleteRegisteredPlayers");

            const getRegisteredPlayersStub = sandbox.stub(db, "getRegisteredPlayers").callsFake((args) => {
                return Promise.resolve([]); // <-- empty
            });

            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {              
                sandbox.assert.notCalled(deleteSpy);
            });
        });

        it('should send an error message if discord user is not registered', () => {

            const handler = UnregisterCommandHandler.getHandler();

            const getRegisteredPlayersStub = sandbox.stub(db, "getRegisteredPlayers").callsFake((args) => {
                return Promise.resolve([]); // <-- empty
            });

            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {              
                sandbox.assert.calledOnce(sendMessageSpy);

                expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);
                expect(passedBotMessage).to.contain("player not registered")
            });
        });

        it('should send an error message if a parameter was passed', () => {

            const handler = UnregisterCommandHandler.getHandler();

            cmd.arguments = [
                "some-argument"
            ];
            
            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {
                
                sandbox.assert.calledOnce(sendMessageSpy);

                expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);
                expect(passedBotMessage).to.contain("invalid amount of arguments");
            });
        });

        it('should send an error message if multiple parameters were passed', () => {

            const handler = UnregisterCommandHandler.getHandler();

            cmd.arguments = [
                "some-argument",
                "some-other-argument"
            ];
            
            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {
                
                sandbox.assert.calledOnce(sendMessageSpy);

                expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);
                expect(passedBotMessage).to.contain("invalid amount of arguments");
            });
        });
    });

});