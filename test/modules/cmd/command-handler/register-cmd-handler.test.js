/* eslint-env mocha */

const { expect } = require('chai');
const sinon = require('sinon');

const logger = require('../../../../src/modules/log').getLogger();
const RegisterCommandHandler = require('../../../../src/modules/cmd/command-handler/register-cmd-handler');

describe('RegisterCommandHandler', () => {
  let sandbox = {};

  let cmd = {};
  let bot = {};

  let passedTo = '';
  let passedEmbed = {};

  let db = {};

  let playerByNameData = {};
  let pubg = {};

  let sendMessageSpy = {};
  let playerByNameSpy = {};

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
      getRegions: () => Promise.resolve([
        {
          id: 1,
          region_name: 'some-region-name',
        },
      ]),
      getRegisteredPlayers: () => Promise.resolve([]),
      insertRegisteredPlayer: () => Promise.resolve(1),
    };

    playerByNameData = {
      data: [
        {
          id: 'some-pubg-id',
          attributes: {
            name: 'some-pubg-name',
          },
        },
      ],
    };
    pubg = {
      player: () => Promise.resolve(playerByNameData),
    };

    sendMessageSpy = sandbox.spy(bot, 'sendMessage');
    playerByNameSpy = sandbox.spy(pubg, 'player');
  });

  afterEach(() => {
    sandbox.restore();
  });


  describe('handle()', () => {
    // ----------------------------------------------------------------------------------------
    // Unit Tests
    // ----------------------------------------------------------------------------------------
    it('should call the pubg api for the player id with the given argument', () => {
      const handler = RegisterCommandHandler.getHandler();

      cmd.arguments = [
        'to-register-pubg-name',
      ];

      const handlePromise = handler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.calledOnce(playerByNameSpy);
        expect(cmd.arguments[0]).to.be.equal(playerByNameSpy.getCall(0).args[0].name);
      });
    });

    it('should query the db for registered players', () => {
      const handler = RegisterCommandHandler.getHandler();

      cmd.arguments = [
        'to-register-pubg-name',
      ];

      const getPlayerSpy = sandbox.spy(db, 'getRegisteredPlayers');

      const handlePromise = handler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.calledOnce(getPlayerSpy);
        expect(getPlayerSpy.getCall(0).args[0].discord_id).to.be.equal(cmd.discordUser.id);
      });
    });

    it('should query the database for the global region if only a single argument was given', () => {
      const handler = RegisterCommandHandler.getHandler();

      cmd.arguments = [
        'to-register-pubg-name',
      ];

      const getRegionsSpy = sandbox.spy(db, 'getRegions');
      const handlePromise = handler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.calledOnce(getRegionsSpy);
        expect(getRegionsSpy.getCall(0).args[0].is_global_region).to.be.equal(true);
      });
    });

    it('should create an database entry if player id does not exist yet', () => {
      const handler = RegisterCommandHandler.getHandler();

      cmd.arguments = [
        'to-register-pubg-name',
      ];

      const insertPlayerSpy = sandbox.spy(db, 'insertRegisteredPlayer');
      const handlePromise = handler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.calledOnce(insertPlayerSpy);

        expect(insertPlayerSpy.getCall(0).args[0].discord_id).to.be.equal(cmd.discordUser.id);
        expect(insertPlayerSpy.getCall(0).args[0].discord_name).to.be.equal(cmd.discordUser.name);
        expect(insertPlayerSpy.getCall(0).args[0].pubg_id).to.be.equal(playerByNameData.data[0].id);
        expect(insertPlayerSpy.getCall(0).args[0].pubg_name)
          .to.be.equal(playerByNameData.data[0].attributes.name);
      });
    });

    it('should send an success message if player was succesfully registered', () => {
      const handler = RegisterCommandHandler.getHandler();

      cmd.arguments = [
        'to-register-pubg-name',
      ];

      const handlePromise = handler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.calledOnce(sendMessageSpy);

        expect(passedTo).to.be.equal(cmd.discordUser.id);
        expect(passedEmbed.fields[0].value).to.contain(playerByNameData.data[0].attributes.name);
        expect(passedEmbed.fields[0].value).to.contain('successfully registered');
      });
    });

    it('should send an error message if the pubg api request fails', () => {
      const handler = RegisterCommandHandler.getHandler();

      cmd.arguments = [
        'to-register-pubg-name',
      ];

      pubg.player = () => Promise.reject(new Error('whatever'));

      const handlePromise = handler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.calledOnce(sendMessageSpy);

        expect(passedTo).to.be.equal(cmd.discordUser.id);
        expect(passedEmbed.fields[0].value).to.contain('whatever');
      });
    });

    it('should send an error message if there already exists an entry for the player', () => {
      const handler = RegisterCommandHandler.getHandler();

      cmd.arguments = [
        'to-register-pubg-name',
      ];

      sandbox.stub(db, 'getRegisteredPlayers').callsFake(() => Promise.resolve(['some-already-existing-player-name']));

      const handlePromise = handler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sinon.assert.calledOnce(sendMessageSpy);

        expect(passedTo).to.be.equal(cmd.discordUser.id);
        expect(passedEmbed.fields[0].value).to.contain('already is a player name registered for your discord user');
      });
    });

    it('should send an error message if there already exists an entry for the player (mult.args)', () => {
      const handler = RegisterCommandHandler.getHandler();

      cmd.arguments = [
        'to-register-pubg-name',
        'pc-eu',
      ];

      sandbox.stub(db, 'getRegisteredPlayers').callsFake(() => Promise.resolve(['some-already-existing-player-name']));

      const handlePromise = handler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sinon.assert.calledOnce(sendMessageSpy);

        expect(passedTo).to.be.equal(cmd.discordUser.id);
        expect(passedEmbed.fields[0].value).to.contain('already is a player name registered for your discord user');
      });
    });

    it('should query the database for the region given by the second argument', () => {
      const handler = RegisterCommandHandler.getHandler();

      cmd.arguments = [
        'to-register-pubg-name',
        'pc-na',
      ];

      const getRegionsSpy = sandbox.spy(db, 'getRegions');
      const handlePromise = handler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sandbox.assert.calledOnce(getRegionsSpy);
        expect(getRegionsSpy.getCall(0).args[0].region_name).to.be.equal('pc-na');
      });
    });

    it('should send an eror message if no argument was given', () => {
      const handler = RegisterCommandHandler.getHandler();

      cmd.arguments = [
        // no  arguments
      ];

      const handlePromise = handler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sinon.assert.calledOnce(sendMessageSpy);

        expect(passedTo).to.be.equal(cmd.discordUser.id);
        expect(passedEmbed.fields[0].value).to.contain('invalid amount of arguments');
      });
    });

    it('should send an error message if the second argument is an invalid region', () => {
      const handler = RegisterCommandHandler.getHandler();

      cmd.arguments = [
        'to-register-player-name',
        'xbox-invalid',
      ];

      const handlePromise = handler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sinon.assert.calledOnce(sendMessageSpy);

        expect(passedTo).to.be.equal(cmd.discordUser.id);
        expect(passedEmbed.fields[0].value).to.contain('unknown region');
        expect(passedEmbed.fields[0].value).to.contain('xbox-invalid');
      });
    });

    it('should send an error message if more than two arguments were given', () => {
      const handler = RegisterCommandHandler.getHandler();

      cmd.arguments = [
        'to-register-pubg-name-1',
        'pc-eu',
        'some-third-argument',
      ];

      const handlePromise = handler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        sinon.assert.calledOnce(sendMessageSpy);

        expect(passedTo).to.be.equal(cmd.discordUser.id);
        expect(passedEmbed.fields[0].value).to.contain('invalid amount of arguments');
      });
    });

    it('should send an error message if multiple global regions are returned (single arg)', () => {
      const handler = RegisterCommandHandler.getHandler();

      cmd.arguments = [
        'to-register-pubg-name',
      ];

      sandbox.stub(db, 'getRegions').callsFake(() => Promise.resolve([
        {
          id: 1,
          region_name: 'pc-na',
          is_global_region: true,
        },
        {
          id: 2,
          region_name: 'pc-eu',
          is_global_region: true,
        },
      ]));

      const handlePromise = handler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        expect(passedTo).to.be.equal(cmd.discordUser.id);
        expect(passedEmbed.fields[0].value).to.contain('weird');
      });
    });

    it('should send an error message if multiple global regions are returned (mult. args)', () => {
      const handler = RegisterCommandHandler.getHandler();

      cmd.arguments = [
        'to-register-pubg-name',
        'pc-na',
      ];

      sandbox.stub(db, 'getRegions').callsFake(() => Promise.resolve([
        {
          id: 1,
          region_name: 'pc-na',
          is_global_region: true,
        },
        {
          id: 2,
          region_name: 'pc-eu',
          is_global_region: true,
        },
      ]));

      const handlePromise = handler.handle(cmd, bot, db, pubg);

      return handlePromise.then(() => {
        expect(passedTo).to.be.equal(cmd.discordUser.id);
        expect(passedEmbed.fields[0].value).to.contain('weird');
      });
    });
  });
});
