const expect = require('chai').expect;
const sinon = require('sinon');

const logger = require('../../../../src/modules/log').getLogger();
const HelpCommandHandler = require('../../../../src/modules/cmd/command-handler/help-cmd-handler');

describe('HelpCommandHandler.handle()', () => {

    let debugStub = {};
    let infoStub = {};
    let warnStub = {};
    let errorStub = {};

    beforeEach(() => {

        // stub all log functions
        debugStub = sinon.stub(logger, "debug").callsFake((message) => {
            // do nothing
        });
        infoStub = sinon.stub(logger, "info").callsFake((message) => {
            // do nothing
        });
        warnStub = sinon.stub(logger, "warn").callsFake((message) => {
            // do nothing
        });
        errorStub = sinon.stub(logger, "error").callsFake((message) => {
            // do nothing
        });
    });

    afterEach(() => {
        
        debugStub.restore();
        infoStub.restore();
        warnStub.restore();
        errorStub.restore();
    });

    it('should send a message to the right channel', () => {

        const handler = HelpCommandHandler.getHandler();
        
        let passedChannelId = '';
        let passedMessage = '';

        const cmd = {
            arguments: []
        };
        const bot = {
            sendMessage: function(params) {
                passedChannelId = params.to;
                passedMessage = params.message;
            }
        };
        const db = {};
        const pubg = {};

        let sendMessageSpy = sinon.spy(bot, 'sendMessage');

        cmd.discordUser = {};
        cmd.discordUser.channelId = '123';

        //cmd, bot, db, pubg
        handler.handle(cmd, bot, db, pubg);
        sendMessageSpy.restore();

        sinon.assert.calledOnce(sendMessageSpy);
        expect(passedChannelId).to.be.equal('123');
        
    })

    it('should send a message containing help about every command', () => {

        const handler = HelpCommandHandler.getHandler();
        
        let passedChannelId = '';
        let passedMessage = '';

        const cmd = {
            arguments: []
        };
        const bot = {
            sendMessage: function(params) {
                passedChannelId = params.to;
                passedMessage = params.message;
            }
        };
        const db = {};
        const pubg = {};

        let sendMessageSpy = sinon.spy(bot, 'sendMessage');

        cmd.discordUser = {};
        cmd.discordUser.channelId = '123';

        //cmd, bot, db, pubg
        handler.handle(cmd, bot, db, pubg);
        sendMessageSpy.restore();

        sinon.assert.calledOnce(sendMessageSpy);

        expect(passedMessage).to.contain('!statg help');
        expect(passedMessage).to.contain('!statg match');
        expect(passedMessage).to.contain('!statg ping');
        expect(passedMessage).to.contain('!statg register');
        expect(passedMessage).to.contain('!statg stats');
        expect(passedMessage).to.contain('!statg status');
        expect(passedMessage).to.contain('!statg version');
    });

    it('should send an error if there is a single argument given', () => {

        const handler = HelpCommandHandler.getHandler();
        
        let passedChannelId = '';
        let passedMessage = '';

        const cmd = {
            arguments: [
                "some-arg"
            ]
        };
        const bot = {
            sendMessage: function(params) {
                passedChannelId = params.to;
                passedMessage = params.message;
            }
        };
        const db = {};
        const pubg = {};

        let sendMessageSpy = sinon.spy(bot, 'sendMessage');

        cmd.discordUser = {};
        cmd.discordUser.channelId = '123';

        //cmd, bot, db, pubg
        handler.handle(cmd, bot, db, pubg);
        sendMessageSpy.restore();

        sinon.assert.calledOnce(sendMessageSpy);
        expect(passedChannelId).to.be.equal('123');
        expect(passedMessage).to.contain("invalid amount of arguments")
    });

    it('should send an error if there are multiple arguments given', () => {

        const handler = HelpCommandHandler.getHandler();
        
        let passedChannelId = '';
        let passedMessage = '';

        const cmd = {
            arguments: [
                "some-arg",
                "some-other-arg",
                "some-final-arg"
            ]
        };
        const bot = {
            sendMessage: function(params) {
                passedChannelId = params.to;
                passedMessage = params.message;
            }
        };
        const db = {};
        const pubg = {};

        let sendMessageSpy = sinon.spy(bot, 'sendMessage');

        cmd.discordUser = {};
        cmd.discordUser.channelId = '123';

        //cmd, bot, db, pubg
        handler.handle(cmd, bot, db, pubg);
        sendMessageSpy.restore();

        sinon.assert.calledOnce(sendMessageSpy);
        expect(passedChannelId).to.be.equal('123');
        expect(passedMessage).to.contain("invalid amount of arguments")
    });
})