const expect = require('chai').expect;
const sinon = require('sinon');

const HelpCommandHandler = require('../../../../src/modules/cmd/command-handler/help-cmd-handler');

describe('HelpCommandHandler.handle()', () => {

    it('should send a message to the right channel', () => {

        const handler = HelpCommandHandler.getHandler();
        
        let passedChannelId = '';
        let passedMessage = '';

        const cmd = {};
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

        const cmd = {};
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
    })
})