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

    let updateWhereObject = {};
    let updateObject = {};
    let transactingObject = {};

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

        bot = {
            sendMessage: function(params) {
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

        updateObject = {
            update: function(args) {
                return Promise.resolve(1);
            }
        }
        updateWhereObject = {
            where: function(args) {
                return updateObject;
            }
        }

        db = {
            knex: function(args) {
                return updateWhereObject;
            },
            TABLES: {
                registeredPlayer: "registered_player",
                region: "region"
            }
        }

        selectWhereObject = {
            where: function(args) {
                return Promise.resolve([
                    {
                        region_id: 1,
                        region_name: "some-region"
                    }
                ]);
            }
        }
        fromObject = {
            from: function(args) {
                return selectWhereObject;
            }
        }

        db.knex.transaction = function(trx) {
            return fromObject;
        }

        sendMessageSpy = sandbox.spy(bot, "sendMessage");
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('handle()', () => {

        // it('should send an success message if the region was successfully set for player', () => {
            
        //     const handler = RegionCommandHandler.getHandler();
            
        //     cmd.arguments = [
        //         "pc-na"
        //     ];

        //     let handlePromise = handler.handle(cmd, bot, db, pubg);

        //     return handlePromise.then(() => {

        //         sandbox.assert.calledOnce(sendMessageSpy);

        //         expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);
        //         expect(passedBotMessage).to.contain('region successfully set')
        //         expect(passedBotMessage).to.contain("pc-na")
        //     });
        // });

        // it('should query the database for region id', () => {
            
        //     const handler = RegionCommandHandler.getHandler();
            
        //     cmd.arguments = [
        //         "pc-na"
        //     ];

        //     let selectSpy = sandbox.spy(db.knex, "select");
        //     let fromSpy = sandbox.spy(fromObject, "from");
        //     let whereSpy = sandbox.spy(selectWhereObject, "where"); 

        //     let handlePromise = handler.handle(cmd, bot, db, pubg);

        //     return handlePromise.then(() => {

        //         sandbox.assert.calledOnce(selectSpy);
        //         sandbox.assert.calledOnce(fromSpy);
        //         sandbox.assert.calledOnce(whereSpy);

        //         expect(db.TABLES.region).to.be.equal(fromSpy.getCall(0).args[0]);
        //         expect('region_name').to.be.equal(whereSpy.getCall(0).args[0]);
        //         expect('pc-na').to.be.equal(whereSpy.getCall(0).args[1]);
        //     });
        // });

        // it('should update the region for the player in database', () => {
            
        //     const handler = RegionCommandHandler.getHandler();
            
        //     cmd.arguments = [
        //         "pc-na"
        //     ];

        //     let knexSpy = sandbox.spy(db, "knex");
        //     let whereSpy = sandbox.spy(updateWhereObject, "where");
        //     let updateSpy = sandbox.spy(updateObject, "update");

        //     let handlePromise = handler.handle(cmd, bot, db, pubg);

        //     return handlePromise.then(() => {

        //         sandbox.assert.calledOnce(knexSpy);
        //         sandbox.assert.calledOnce(whereSpy);
        //         sandbox.assert.calledOnce(updateSpy);

        //         expect(db.TABLES.registeredPlayer).to.be.equal(knexSpy.getCall(0).args[0]);
        //         expect('discord_id').to.be.equal(whereSpy.getCall(0).args[0]);
        //         expect(cmd.discordUser.id).to.be.equal(whereSpy.getCall(0).args[1]);
        //         expect(1).to.be.equal(updateSpy.getCall(0).args[0].region_id)
        //     });
        // });

        it('should send an success message if region was successfully set', () => {
            // TODO
        });

        it('should update the global region in database', () => {
            // TODO
        });

        it('should use a transaction to update the global region', () => {
            // TODO
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

        // it('should send an error message if the second argument is not "global"', () => {
            
        //     const handler = RegionCommandHandler.getHandler();
            
        //     cmd.arguments = [
        //         "pc-na",
        //         "some-argument"
        //     ]

        //     let handlePromise = handler.handle(cmd, bot, db, pubg);

        //     return handlePromise.then(() => {
        //         sandbox.assert.calledOnce(sendMessageSpy);

        //         expect(passedChannelId).to.be.equal(cmd.discordUser.channelId);
        //         expect(passedBotMessage).to.contain('second argument must be "global" or omitted');
        //     });
        // });

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