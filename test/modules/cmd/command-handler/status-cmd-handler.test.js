/* eslint-env mocha */

const { expect } = require('chai');
const sinon = require('sinon');

const logger = require('../../../../src/modules/log').getLogger();
const StatusCommandHandler = require('../../../../src/modules/cmd/command-handler/status-cmd-handler');

describe('StatusCommandHandler.handle()', () => {
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

  it('should call the pubg api', () => {
    const handler = StatusCommandHandler.getHandler();

    const apiData = {
      data: {
        type: 'status',
        id: 'pubg-api',
        attributes: {
          version: '9.8.1',
          releasedAt: '2018-05-22T14:47:18Z',
        },
      },
    };

    const cmd = {
      discordUser: {
        id: 'some-id',
        channelId: '123',
      },
      arguments: [],
    };
    const bot = {
      sendMessage: () => {},
    };
    const db = {};
    const pubg = {
      status: () => Promise.resolve(apiData),
    };

    const statusSpy = sinon.spy(pubg, 'status');

    const handlePromise = handler.handle(cmd, bot, db, pubg);

    return handlePromise.then(() => {
      sinon.assert.calledOnce(statusSpy);

      statusSpy.restore();
    });
  });

  it('should send a message if the pubg api request succeeded', () => {
    const handler = StatusCommandHandler.getHandler();

    const apiData = {
      data: {
        type: 'status',
        id: 'pubg-api',
        attributes: {
          version: '9.8.1',
          releasedAt: '2018-05-22T14:47:18Z',
        },
      },
    };

    const cmd = {
      discordUser: {
        id: 'some-id',
        channelId: '123',
      },
      arguments: [],
    };
    const bot = {
      sendMessage: () => {},
    };
    const db = {};
    const pubg = {
      status: () => Promise.resolve(apiData),
    };

    const sendMessageSpy = sinon.spy(bot, 'sendMessage');

    const handlePromise = handler.handle(cmd, bot, db, pubg);

    return handlePromise.then(() => {
      sinon.assert.calledOnce(sendMessageSpy);
      sendMessageSpy.restore();
    });
  });

  it('should add status details to the message on success', () => {
    const handler = StatusCommandHandler.getHandler();

    const apiData = {
      data: {
        type: 'status',
        id: 'pubg-api',
        attributes: {
          version: '9.8.1',
          releasedAt: '2018-05-22T14:47:18Z',
        },
      },
    };

    let passedEmbed = {};

    const cmd = {
      discordUser: {
        id: 'some-id',
        channelId: '123',
      },
      arguments: [],
    };
    const bot = {
      sendMessage: (params) => {
        passedEmbed = params.embed;
      },
    };
    const db = {};
    const pubg = {
      status: () => Promise.resolve(apiData),
    };

    const handlePromise = handler.handle(cmd, bot, db, pubg);

    return handlePromise.then(() => {
      expect(passedEmbed.fields[0].value).to.contain('up and ready');
    });
  });

  it('should send the message to the right channel on success', () => {
    const handler = StatusCommandHandler.getHandler();

    const apiData = {
      data: {
        type: 'status',
        id: 'pubg-api',
        attributes: {
          version: '9.8.1',
          releasedAt: '2018-05-22T14:47:18Z',
        },
      },
    };

    let passedTo = '';

    const cmd = {
      discordUser: {
        id: 'some-id',
        channelId: '123',
      },
      arguments: [],
    };
    const bot = {
      sendMessage: (params) => {
        passedTo = params.to;
      },
    };
    const db = {};
    const pubg = {
      status: () => Promise.resolve(apiData),
    };

    const handlePromise = handler.handle(cmd, bot, db, pubg);

    return handlePromise.then(() => {
      expect(passedTo).to.be.equal(cmd.discordUser.id);
    });
  });

  it('should send a message if pubg api rejects the request', () => {
    const handler = StatusCommandHandler.getHandler();

    const error = new Error('some message');

    const cmd = {
      discordUser: {
        id: 'some-id',
        channelId: '123',
      },
      arguments: [],
    };
    const bot = {
      sendMessage: () => {},
    };
    const db = {};
    const pubg = {
      status: () => Promise.reject(error),
    };

    const sendMessageSpy = sinon.spy(bot, 'sendMessage');

    const handlePromise = handler.handle(cmd, bot, db, pubg);

    return handlePromise.then(() => {
      sinon.assert.calledOnce(sendMessageSpy);

      sendMessageSpy.restore();
    });
  });

  it('should add details to the error message', () => {
    const handler = StatusCommandHandler.getHandler();

    const error = new Error('some message');

    let passedEmbed = '';

    const cmd = {
      discordUser: {
        id: 'some-id',
        channelId: '123',
      },
      arguments: [],
    };
    const bot = {
      sendMessage: (params) => {
        passedEmbed = params.embed;
      },
    };
    const db = {};
    const pubg = {
      status: () => Promise.reject(error),
    };

    const handlePromise = handler.handle(cmd, bot, db, pubg);

    return handlePromise.then(() => {
      expect(passedEmbed.fields[0].value).to.contain('some message');
    });
  });

  it('should send the error message to the right channel', () => {
    const handler = StatusCommandHandler.getHandler();

    const error = new Error('some message');

    let passedTo = '';

    const cmd = {
      discordUser: {
        id: 'some-id',
        channelId: '123',
      },
      arguments: [],
    };
    const bot = {
      sendMessage: (params) => {
        passedTo = params.to;
      },
    };
    const db = {};
    const pubg = {
      status: () => Promise.reject(error),
    };

    const handlePromise = handler.handle(cmd, bot, db, pubg);

    return handlePromise.then(() => {
      expect(passedTo).to.be.equal(cmd.discordUser.id);
    });
  });

  it('should log the error', () => {
    const handler = StatusCommandHandler.getHandler();

    const errorMessage = 'some message';
    const error = new Error(errorMessage);

    const cmd = {
      discordUser: {
        id: 'some-id',
        channelId: '123',
      },
      arguments: [],
    };
    const bot = {
      sendMessage: () => {},
    };
    const db = {};
    const pubg = {
      status: () => Promise.reject(error),
    };

    const handlePromise = handler.handle(cmd, bot, db, pubg);

    return handlePromise.then(() => {
      sinon.assert.calledOnce(errorStub);
      const passedError = errorStub.getCall(0).args[0];
      expect(passedError).to.contain(errorMessage);
    });
  });

  it('should send a error message if a single argument was given', () => {
    const handler = StatusCommandHandler.getHandler();

    let passedTo = '';
    let passedEmbed = '';

    const cmd = {
      discordUser: {
        id: 'some-id',
        channelId: '123',
      },
      arguments: [
        'some-argument',
      ],
    };
    const bot = {
      sendMessage: (params) => {
        passedTo = params.to;
        passedEmbed = params.embed;
      },
    };
    const db = {};
    const pubg = {
      status: () => Promise.resolve({}),
    };

    const sendMessageSpy = sinon.spy(bot, 'sendMessage');
    const statusSpy = sinon.spy(pubg, 'status');

    // cmd, bot, db, pubg
    handler.handle(cmd, bot, db, pubg);

    sinon.assert.calledOnce(sendMessageSpy);
    sinon.assert.notCalled(statusSpy);

    expect(passedTo).to.be.equal(cmd.discordUser.id);
    expect(passedEmbed.fields[0].value).to.contain('invalid amount of arguments');

    sendMessageSpy.restore();
    statusSpy.restore();
  });

  it('should send a error message if multiple arguments were given', () => {
    const handler = StatusCommandHandler.getHandler();

    let passedTo = '';
    let passedEmbed = '';

    const cmd = {
      discordUser: {
        id: 'some-id',
        channelId: '123',
      },
      arguments: [
        'some-argument',
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
    const pubg = {
      status: () => Promise.resolve({}),
    };

    const sendMessageSpy = sinon.spy(bot, 'sendMessage');
    const statusSpy = sinon.spy(pubg, 'status');

    // cmd, bot, db, pubg
    handler.handle(cmd, bot, db, pubg);

    sinon.assert.calledOnce(sendMessageSpy);
    sinon.assert.notCalled(statusSpy);

    expect(passedTo).to.be.equal(cmd.discordUser.id);
    expect(passedEmbed.fields[0].value).to.contain('invalid amount of arguments');

    sendMessageSpy.restore();
    statusSpy.restore();
  });
});
