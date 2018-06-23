/* eslint-env mocha */

const { expect } = require('chai');
const sinon = require('sinon');

const logger = require('../../../src/modules/log').getLogger();
const pubgOpHelper = require('../../../src/modules/cmd/pubg-op-helper');

describe('pubg-op-helper', () => {
  let sandbox = {};

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(logger, 'debug').callsFake(() => {});
    sandbox.stub(logger, 'info').callsFake(() => {});
    sandbox.stub(logger, 'warn').callsFake(() => {});
    sandbox.stub(logger, 'error').callsFake(() => {});
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getUrlForPlayer()', () => {
    it('should return url that contains the PUBG.OP.GG base url', () => {
      const playerName = 'some-player';
      const serverName = 'eu';

      const result = pubgOpHelper.getUrlForPlayer(playerName, serverName);

      expect(result).to.contain('https://pubg.op.gg/user');
    });

    it('should return url that contains the player name', () => {
      const playerName = 'some-player';
      const serverName = 'eu';

      const result = pubgOpHelper.getUrlForPlayer(playerName, serverName);

      expect(result).to.contain(playerName);
    });

    it('should return url that contains the server', () => {
      const playerName = 'some-player';
      const serverName = 'eu';

      const result = pubgOpHelper.getUrlForPlayer(playerName, serverName);

      expect(result).to.contain(`?server=${serverName}`);
    });

    it('should throw an error if player name is null', () => {
      let errorMessage = '';

      try {
        pubgOpHelper.getUrlForPlayer(null, 'eu');
      } catch (error) {
        errorMessage = error.message;
      }

      expect(errorMessage).to.be.equal('invalid player name "null"');
    });

    it('should throw an error if player name is undefined', () => {
      let errorMessage = '';

      try {
        pubgOpHelper.getUrlForPlayer(undefined, 'eu');
      } catch (error) {
        errorMessage = error.message;
      }

      expect(errorMessage).to.be.equal('invalid player name "undefined"');
    });

    it('should throw an error if region area is null', () => {
      let errorMessage = '';

      try {
        pubgOpHelper.getUrlForPlayer('some-player', null);
      } catch (error) {
        errorMessage = error.message;
      }

      expect(errorMessage).to.be.equal('invalid server "null"');
    });

    it('should throw an error if region area is undefined', () => {
      let errorMessage = '';

      try {
        pubgOpHelper.getUrlForPlayer('some-player', undefined);
      } catch (error) {
        errorMessage = error.message;
      }

      expect(errorMessage).to.be.equal('invalid server "undefined"');
    });
  });
});
