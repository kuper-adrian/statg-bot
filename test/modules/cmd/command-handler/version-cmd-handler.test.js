/* eslint-env mocha */

const { expect } = require('chai');
const sinon = require('sinon');

const logger = require('../../../../src/modules/log').getLogger();
const VersionCommandHandler = require('../../../../src/modules/cmd/command-handler/version-cmd-handler');

describe('VersionCommandHandler.handle()', () => {
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

  it('should send a message to the right channel', () => {
    const handler = VersionCommandHandler.getHandler();

    const cmd = {
      arguments: [],
    };
    const bot = {
      sendMessage: () => { },
    };
    const db = {};
    const pubg = {};

    const sendMessageSpy = sinon.spy(bot, 'sendMessage');

    cmd.discordUser = {};
    cmd.discordUser.channelId = '123';

    // cmd, bot, db, pubg
    handler.handle(cmd, bot, db, pubg);

    sinon.assert.calledOnce(sendMessageSpy);

    sendMessageSpy.restore();
  });

  it('should send a error message if there is a single argument given', () => {
    const handler = VersionCommandHandler.getHandler();

    let passedEmbed = '';

    const cmd = {
      arguments: [
        'some-argument',
      ],
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

    sinon.assert.calledOnce(sendMessageSpy);
    expect(passedEmbed.fields[0].value).to.contain('invalid amount of arguments');

    sendMessageSpy.restore();
  });

  it('should send a error message if there are multiple arguments given', () => {
    const handler = VersionCommandHandler.getHandler();

    let passedEmbed = '';

    const cmd = {
      arguments: [
        'some-argument',
        'some-other-argument',
        'some-last-argument',
      ],
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

    sinon.assert.calledOnce(sendMessageSpy);
    expect(passedEmbed.fields[0].value).to.contain('invalid amount of arguments');

    sendMessageSpy.restore();
  });

  it('should send a message containing the version of the bot', () => {
    const handler = VersionCommandHandler.getHandler();

    const version = '1.1.1';
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

    cmd.discordUser = {};
    cmd.discordUser.channelId = '123';

    handler.handle(cmd, bot, db, pubg);

    expect(passedEmbed.fields[0].value).to.contain(version);
  });

  // ! most important test right here
  it('should send a message containing the author of the bot', () => {
    const handler = VersionCommandHandler.getHandler();

    const author = 'Adrian Kuper';
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

    cmd.discordUser = {};
    cmd.discordUser.channelId = '123';

    handler.handle(cmd, bot, db, pubg);

    expect(passedEmbed.fields[1].value).to.contain(author);
    expect(passedEmbed.fields[1].value).to.contain('https://github.com/kuper-adrian');
  });

  it('should send a message containing the github repo of the bot', () => {
    const handler = VersionCommandHandler.getHandler();

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

    cmd.discordUser = {};
    cmd.discordUser.channelId = '123';

    handler.handle(cmd, bot, db, pubg);

    expect(passedEmbed.fields[2].value).to.contain('https://github.com/kuper-adrian/statg-bot');
  });
});
