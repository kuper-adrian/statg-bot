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

        let whereObject = {};
        let fromObject = {};

        let passedPlayerName = '';
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
                knex: function(args) {
                }
            }
            whereObject = {
                where: function(args) {
                    return [];
                }
            }
            fromObject = {
                from: function(args) {
                    return whereObject;
                }
            }
            db.knex.select = function() {
                return Promise.resolve(fromObject);
            }

            pubg = {
                playerByName: function(name) {
                    passedPlayerName = name;
                    return Promise.resolve({
                        data: [
                            {
                                id: "some-pubg-id",
                                attributes: {
                                    name: "some-pubg-name"
                                }
                            }
                        ]
                    });
                }
            };

            sendMessageSpy = sandbox.spy(bot, "sendMessage");
            playerByNameSpy = sandbox.spy(pubg, "playerByName");
        });

        afterEach(() => {       
            sandbox.restore();
        });


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

        it('should create an database entry if player id does not exist yet', () => {
            // TODO
        });

        it('should send an success message if player was succesfully registered', () => {
            // TODO
        });
        
        it('should send an error message if there already exists an entry for the player', () => {
            
            const handler = RegisterCommandHandler.getHandler();

            cmd.arguments = [
                "to-register-pubg-name"
            ];

            // TODO mock db

            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {
                // TODO assertions
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