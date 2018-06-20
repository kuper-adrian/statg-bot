const assert = require('chai').assert;
const expect = require('chai').expect;
const sinon = require('sinon');

const logger = require('../../../../src/modules/log').getLogger();

const RegionCommandHandler = require('../../../../src/modules/cmd/command-handler/region-cmd-handler');

describe('RegionCommandHandler', () => {

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
        sandbox.stub(logger, "debug").callsFake((message) => {
            // do nothing
        });
        sandbox.stub(logger, "info").callsFake((message) => {
            // do nothing
        });
        sandbox.stub(logger, "warn").callsFake((message) => {
            // do nothing
        });
        sandbox.stub(logger, "error").callsFake((message) => {
            // do nothing
        });

        bot = {
            sendMessage: (params) => {
                passedChannelId = params.to;
                passedBotMessage = params.message;
            }
        };

        cmd = {
            discordUser: {
                id: "some-discord-id",
                channelId: "123"
            },
            arguments: []
        };

        db = {
            setGlobalRegion: () => Promise.resolve()
        }

        sendMessageSpy = sandbox.spy(bot, "sendMessage");
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('handle()', () => {

        it('should send an success message if region was successfully set', () => {
            const handler = RegionCommandHandler.getHandler();

            const newRegion = "pc-na";
            cmd.arguments = [
                newRegion,
            ];

            const handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {
                sandbox.assert.calledOnce(sendMessageSpy);

                expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);
                expect(passedBotMessage).to.contain(newRegion);
                expect(passedBotMessage).to.contain('region successfully set');
            });
        });

        it('should update the global region in database', () => {
            const handler = RegionCommandHandler.getHandler();

            const newRegion = "pc-na";
            cmd.arguments = [
                newRegion,
            ];
            
            const setGlobalRegionSpy = sandbox.spy(db, "setGlobalRegion");

            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {
                sandbox.assert.calledOnce(setGlobalRegionSpy);
                expect(setGlobalRegionSpy.getCall(0).args[0]).to.be.equal(newRegion);
            });
        });

        it('should send an error message if the database operation fails', () => {
            const handler = RegionCommandHandler.getHandler();

            const errorMessage = 'some error';
            const newRegion = "pc-na";
            cmd.arguments = [
                newRegion,
            ];
            
            const setGlobalRegionStub = sandbox.stub(db, "setGlobalRegion")
                .callsFake(() => Promise.reject(new Error(errorMessage)));

            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {
                sandbox.assert.calledOnce(setGlobalRegionStub);
                expect(setGlobalRegionStub.getCall(0).args[0]).to.be.equal(newRegion);

                sandbox.assert.calledOnce(sendMessageSpy);
                expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);
                expect(passedBotMessage).to.contain(errorMessage);
            });
        });

        it('should send an error message if no arguments were passed', () => {
            
            const handler = RegionCommandHandler.getHandler();
            
            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {
                sandbox.assert.calledOnce(sendMessageSpy);

                expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);
                expect(passedBotMessage).to.contain("invalid amount of arguments");
            });
        });

        it('should send an error message if more than one argument was passed', () => {
            
            const handler = RegionCommandHandler.getHandler();
            
            cmd.arguments = [
                "pc-na",
                "second-argument"
            ]

            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {
                sandbox.assert.calledOnce(sendMessageSpy);

                expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);
                expect(passedBotMessage).to.contain("invalid amount of arguments");
            });
        });

        it('should send an error message if an invalid region was passed', () => {
            
            const handler = RegionCommandHandler.getHandler();
            
            cmd.arguments = [
                "pc-invalid"
            ]

            let handlePromise = handler.handle(cmd, bot, db, pubg);

            return handlePromise.then(() => {
                sandbox.assert.calledOnce(sendMessageSpy);

                expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);
                expect(passedBotMessage).to.contain('unknown region "pc-invalid"');
            });
        });
    });
});