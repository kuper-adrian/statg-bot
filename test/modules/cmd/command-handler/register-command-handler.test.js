const assert = require('chai').assert;
const expect = require('chai').expect;
const sinon = require('sinon');

const logger = require('../../../../src/modules/log').getLogger();

const RegisterCommandHandler = require('../../../../src/modules/cmd/command-handler/register-cmd-handler');


describe('RegisterCommandHandler', () => {

    describe('handle()', () => {

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

        let insertObject = {};
        let whereObject = {};
        let fromObject = {};

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


            insertObject = {
                insert: function() {
                    return Promise.resolve(1);
                }
            }
            db = {
                knex: function(args) {
                    return insertObject;
                },
                TABLES: {
                    registeredPlayer: "registered_player"
                }
            }
            whereObject = {
                where: function(args) {
                    return Promise.resolve([]);
                }
            }
            fromObject = {
                from: function(args) {
                    return whereObject;
                }
            }
            db.knex.select = function() {
                return fromObject;
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
            
            let selectSpy = sandbox.spy(db.knex, "select");
            let fromSpy = sandbox.spy(fromObject, "from");
            let whereSpy = sandbox.spy(whereObject, "where");

            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {
                sandbox.assert.calledOnce(selectSpy);
                sandbox.assert.calledOnce(fromSpy);
                sandbox.assert.calledOnce(whereSpy);

                sandbox.assert.calledWith(fromSpy, db.TABLES.registeredPlayer);
                expect('discord_id').to.be.equal(whereSpy.getCall(0).args[0]);
                expect(cmd.discordUser.id).to.be.equal(whereSpy.getCall(0).args[1]);
            })
        });

        it('should create an database entry if player id does not exist yet', () => {
            
            const handler = RegisterCommandHandler.getHandler();

            cmd.arguments = [
                "to-register-pubg-name"
            ];

            let knexSpy = sandbox.spy(db, "knex");
            let insertSpy = sandbox.spy(insertObject, "insert");

            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {
                sandbox.assert.calledOnce(knexSpy);
                sandbox.assert.calledOnce(insertSpy);

                sandbox.assert.calledWith(knexSpy, db.TABLES.registeredPlayer);
                expect(cmd.discordUser.id).to.be.equal(insertSpy.getCall(0).args[0].discord_id);
                expect(cmd.discordUser.name).to.be.equal(insertSpy.getCall(0).args[0].discord_name);
                expect(playerByNameData.data[0].id).to.be.equal(insertSpy.getCall(0).args[0].pubg_id);
                expect(playerByNameData.data[0].attributes.name).to.be.equal(insertSpy.getCall(0).args[0].pubg_name);
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

            sandbox.stub(whereObject, "where").callsFake((args) => {
                return Promise.resolve(["some-already-existing-player-name"]);
            });

            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {
                sinon.assert.calledOnce(sendMessageSpy);

                expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);
                expect(passedBotMessage).to.contain("already is a player name registered for your discord user");
            });
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

        it('should send an error message if multiple arguments were given', () => {
            
            const handler = RegisterCommandHandler.getHandler();

            cmd.arguments = [
                "to-register-pubg-name-1",
                "to-register-pubg-name-2"
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