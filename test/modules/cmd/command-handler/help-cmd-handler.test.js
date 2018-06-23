/* eslint-env mocha */

const { expect } = require('chai');
const sinon = require('sinon');

const logger = require('../../../../src/modules/log').getLogger();
const HelpCommandHandler = require('../../../../src/modules/cmd/command-handler/help-cmd-handler');

describe('HelpCommandHandler', () => {
  let debugStub = {};
  let infoStub = {};
  let warnStub = {};
  let errorStub = {};

  beforeEach(() => {
    // stub all log functions
    debugStub = sinon.stub(logger, 'debug').callsFake(() => {
      // do nothing
    });
    infoStub = sinon.stub(logger, 'info').callsFake(() => {
      // do nothing
    });
    warnStub = sinon.stub(logger, 'warn').callsFake(() => {
      // do nothing
    });
    errorStub = sinon.stub(logger, 'error').callsFake(() => {
      // do nothing
    });
  });

  afterEach(() => {
    debugStub.restore();
    infoStub.restore();
    warnStub.restore();
    errorStub.restore();
  });

  describe('handle()', () => {
    it('should send a message to the right channel', () => {
      const handler = HelpCommandHandler.getHandler();

      let passedTo = '';

      const cmd = {
        arguments: [],
      };
      const bot = {
        sendMessage: (params) => {
          passedTo = params.to;
        },
      };
      const db = {};
      const pubg = {};

      const sendMessageSpy = sinon.spy(bot, 'sendMessage');

      cmd.discordUser = {};
      cmd.discordUser.id = '123';

      // cmd, bot, db, pubg
      handler.handle(cmd, bot, db, pubg);
      sendMessageSpy.restore();

      sinon.assert.calledOnce(sendMessageSpy);
      expect(passedTo).to.be.equal(cmd.discordUser.id);
    });

    it('should send a message containing help about every command', () => {
      const handler = HelpCommandHandler.getHandler();

      let passedEmbed = '';

      const cmd = {
        arguments: [],
      };
      const bot = {
        sendMessage: (params) => {
          passedEmbed = params.embed;
        },
      };
      const db = {};
      const pubg = {};

      const sendMessageSpy = sinon.spy(bot, 'sendMessage');

      cmd.discordUser = {};
      cmd.discordUser.channelId = '123';

      // cmd, bot, db, pubg
      handler.handle(cmd, bot, db, pubg);
      sendMessageSpy.restore();

      sinon.assert.calledOnce(sendMessageSpy);

      expect(passedEmbed.fields[0].value).to.contain('https://github.com/kuper-adrian/statg-bot/blob/master/README.md#Commands');
    });

    it('should send an error if there is a single argument given', () => {
      const handler = HelpCommandHandler.getHandler();

      let passedTo = '';
      let passedEmbed = '';

      const cmd = {
        arguments: [
          'some-arg',
        ],
      };
      const bot = {
        sendMessage: (params) => {
          passedTo = params.to;
          passedEmbed = params.embed;
        },
      };
      const db = {};
      const pubg = {};

      const sendMessageSpy = sinon.spy(bot, 'sendMessage');

      cmd.discordUser = {};
      cmd.discordUser.id = '123';

      // cmd, bot, db, pubg
      handler.handle(cmd, bot, db, pubg);
      sendMessageSpy.restore();

      sinon.assert.calledOnce(sendMessageSpy);
      expect(passedTo).to.be.equal(cmd.discordUser.id);
      expect(passedEmbed.fields[0].value).to.contain('invalid amount of arguments');
    });

    it('should send an error message if there are multiple arguments given', () => {
      const handler = HelpCommandHandler.getHandler();

      let passedTo = '';
      let passedEmbed = '';

      const cmd = {
        arguments: [
          'some-arg',
          'some-other-arg',
          'some-final-arg',
        ],
      };
      const bot = {
        sendMessage: (params) => {
          passedTo = params.to;
          passedEmbed = params.embed;
        },
      };
      const db = {};
      const pubg = {};

      const sendMessageSpy = sinon.spy(bot, 'sendMessage');

      cmd.discordUser = {};
      cmd.discordUser.id = '123';

      // cmd, bot, db, pubg
      handler.handle(cmd, bot, db, pubg);
      sendMessageSpy.restore();

      sinon.assert.calledOnce(sendMessageSpy);
      expect(passedTo).to.be.equal(cmd.discordUser.id);
      expect(passedEmbed.fields[0].value).to.contain('invalid amount of arguments');
    });
  });
});
