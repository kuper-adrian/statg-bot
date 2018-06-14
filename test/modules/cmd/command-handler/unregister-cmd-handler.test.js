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

    let delObject = {};
    let deleteWhereObject = {};

    let fromObject = {};
    let selectWhereObject = {};

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


        delObject = {
            del: function() {
                return Promise.resolve(1);
            }
        }
        deleteWhereObject = {
            where: function(args) {
                return delObject;
            }
        }

        db = {
            knex: function(args) {
                return deleteWhereObject;
            },
            TABLES: {
                registeredPlayer: "registered_player"
            }
        }

        selectWhereObject = {
            where: function(args) {
                return Promise.resolve([]);
            }
        }
        fromObject = {
            from: function(args) {
                return selectWhereObject;
            }
        }
        db.knex.select = function() {
            return fromObject;
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

            let selectWhereStub = sandbox.stub(selectWhereObject, "where").callsFake((args) => {
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

            let selectSpy = sandbox.spy(db.knex, "select");
            let fromSpy = sandbox.spy(fromObject, "from");
            let whereSpy = sandbox.spy(selectWhereObject, "where");

            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {
                sandbox.assert.calledOnce(selectSpy);
                sandbox.assert.calledOnce(fromSpy);
                sandbox.assert.calledOnce(whereSpy);

                sandbox.assert.calledWith(fromSpy, db.TABLES.registeredPlayer);
                expect('discord_id').to.be.equal(whereSpy.getCall(0).args[0]);
                expect(cmd.discordUser.id).to.be.equal(whereSpy.getCall(0).args[1]);
            });
        });

        it('should execute the delete statement if user is registered', () => {

            const handler = UnregisterCommandHandler.getHandler();

            let whereSpy = sandbox.spy(deleteWhereObject, "where");
            let deleteSpy = sandbox.spy(delObject, "del");

            let selectWhereStub = sandbox.stub(selectWhereObject, "where").callsFake((args) => {
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
                sandbox.assert.calledOnce(whereSpy);
                sandbox.assert.calledOnce(deleteSpy);

                expect('discord_id').to.be.equal(whereSpy.getCall(0).args[0]);
                expect(cmd.discordUser.id).to.be.equal(whereSpy.getCall(0).args[1]);
            });
        });

        it('should not execute a delete statement if user is not registered', () => {
            
            const handler = UnregisterCommandHandler.getHandler();

            let whereSpy = sandbox.spy(deleteWhereObject, "where");
            let deleteSpy = sandbox.spy(delObject, "del");

            let selectWhereStub = sandbox.stub(selectWhereObject, "where").callsFake((args) => {
                return Promise.resolve([]); // <-- empty
            });

            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {              
                sandbox.assert.notCalled(whereSpy);
                sandbox.assert.notCalled(deleteSpy);
            });
        });

        it('should send an error message if discord user is not registered', () => {

            const handler = UnregisterCommandHandler.getHandler();

            let selectWhereStub = sandbox.stub(selectWhereObject, "where").callsFake((args) => {
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