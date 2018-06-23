/* eslint-env mocha */

const { expect } = require('chai');
const sinon = require('sinon');

const logger = require('../../../../src/modules/log').getLogger();
const UnregisterCommandHandler = require('../../../../src/modules/cmd/command-handler/unregister-cmd-handler');

describe('UnregisterCommandHandler', () => {
  let sandbox = {};

  let cmd = {};
  let bot = {};
  let db = {};
  const pubg = {};

  let passedTo = '';
  let passedEmbed = {};

  let sendMessageSpy = {};

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // stub all log functions
    sandbox.stub(logger, 'debug').callsFake(() => {
      // do nothing
    });
    sandbox.stub(logger, 'info').callsFake(() => {
      // do nothing
    });
    sandbox.stub(logger, 'warn').callsFake(() => {
      // do nothing
    });
    sandbox.stub(logger, 'error').callsFake(() => {
      // do nothing
    });

    cmd = {
      discordUser: {
        id: 'some-discord-id',
        channelId: '123',
      },
      arguments: [],
    };

    bot = {
      sendMessage: (params) => {
        passedTo = params.to;
        passedEmbed = params.embed;
      },
    };

    db = {
      getRegisteredPlayers: () => Promise.resolve([]),
      deleteRegisteredPlayers: () => Promise.resolve(1),
    };

    sendMessageSpy = sandbox.spy(bot, 'sendMessage');
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

      sandbox.stub(db, 'getRegisteredPlayers').callsFake(() => Promise.resolve([
        {
          discord_id: 1,
          discord_name: 'some-discord-name',
          pubg_id: 42,
          pubg_name: 'some-pubg-name',
        },
      ]));

      const handlePromise = handler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.calledOnce(sendMessageSpy);

        expect(passedTo).to.be.equal(cmd.discordUser.id);
        expect(passedEmbed.fields[0].value).to.contain('some-pubg-name');
        expect(passedEmbed.fields[0].value).to.contain('successfully unregistered');
      });
    });

    it('should query the database for the discord user', () => {
      const handler = UnregisterCommandHandler.getHandler();

      const getRegisteredPlayersSpy = sandbox.spy(db, 'getRegisteredPlayers');

      const handlePromise = handler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.calledOnce(getRegisteredPlayersSpy);
        expect(getRegisteredPlayersSpy.getCall(0).args[0].discord_id)
          .to.be.equal(cmd.discordUser.id);
      });
    });

    it('should execute the delete statement if user is registered', () => {
      const handler = UnregisterCommandHandler.getHandler();

      const deleteSpy = sandbox.spy(db, 'deleteRegisteredPlayers');

      const getRegisteredPlayersStub = sandbox.stub(db, 'getRegisteredPlayers').callsFake(() => Promise.resolve([
        {
          discord_id: 1,
          discord_name: 'some-discord-name',
          pubg_id: 42,
          pubg_name: 'some-pubg-name',
        },
      ]));

      const handlePromise = handler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.calledOnce(deleteSpy);

        expect(getRegisteredPlayersStub.getCall(0).args[0].discord_id)
          .to.be.equal(cmd.discordUser.id);
      });
    });

    it('should not execute a delete statement if user is not registered', () => {
      const handler = UnregisterCommandHandler.getHandler();

      const deleteSpy = sandbox.spy(db, 'deleteRegisteredPlayers');

      sandbox.stub(db, 'getRegisteredPlayers').callsFake(() => Promise.resolve([])); // <-- empty

      const handlePromise = handler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.notCalled(deleteSpy);
      });
    });

    it('should send an error message if discord user is not registered', () => {
      const handler = UnregisterCommandHandler.getHandler();

      sandbox.stub(db, 'getRegisteredPlayers').callsFake(() => Promise.resolve([])); // <-- empty

      const handlePromise = handler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.calledOnce(sendMessageSpy);

        expect(passedTo).to.be.equal(cmd.discordUser.id);
        expect(passedEmbed.fields[0].value).to.contain('player not registered');
      });
    });

    it('should send an error message if a parameter was passed', () => {
      const handler = UnregisterCommandHandler.getHandler();

      cmd.arguments = [
        'some-argument',
      ];

      const handlePromise = handler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.calledOnce(sendMessageSpy);

        expect(passedTo).to.be.equal(cmd.discordUser.id);
        expect(passedEmbed.fields[0].value).to.contain('invalid amount of arguments');
      });
    });

    it('should send an error message if multiple parameters were passed', () => {
      const handler = UnregisterCommandHandler.getHandler();

      cmd.arguments = [
        'some-argument',
        'some-other-argument',
      ];

      const handlePromise = handler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.calledOnce(sendMessageSpy);

        expect(passedTo).to.be.equal(cmd.discordUser.id);
        expect(passedEmbed.fields[0].value).to.contain('invalid amount of arguments');
      });
    });
  });
});
