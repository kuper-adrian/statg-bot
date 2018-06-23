/* eslint-env mocha */

const { expect } = require('chai');
const sinon = require('sinon');

const logger = require('../../../src/modules/log').getLogger();
const regionHelper = require('../../../src/modules/cmd/region-helper');

describe('region-helper', () => {
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

  describe('getPlatformFromRegion()', () => {
    it('should throw an error if an invalid region was passed', () => {
      let errorMessage = '';

      try {
        regionHelper.getPlatformFromRegion('pc-invalid');
      } catch (error) {
        errorMessage = error.message;
      }

      expect(errorMessage).to.be.equal('invalid region "pc-invalid"');
    });

    it('should throw an error if null was passed', () => {
      let errorMessage = '';

      try {
        regionHelper.getPlatformFromRegion(null);
      } catch (error) {
        errorMessage = error.message;
      }

      expect(errorMessage).to.be.equal('invalid region "null"');
    });

    it('should throw an error if undefined was passed', () => {
      let errorMessage = '';

      try {
        regionHelper.getPlatformFromRegion(undefined);
      } catch (error) {
        errorMessage = error.message;
      }

      expect(errorMessage).to.be.equal('invalid region "undefined"');
    });

    it('should return the platform part of the region "pc-eu"', () => {
      const region = 'pc-eu';

      const result = regionHelper.getPlatformFromRegion(region);

      expect(result).to.be.equal('pc');
    });

    it('should return the platform part of the region "pc-kakao"', () => {
      const region = 'pc-kakao';

      const result = regionHelper.getPlatformFromRegion(region);

      expect(result).to.be.equal('pc');
    });

    it('should return the platform part of the region "xbox-eu"', () => {
      const region = 'xbox-eu';

      const result = regionHelper.getPlatformFromRegion(region);

      expect(result).to.be.equal('xbox');
    });
  });

  describe('getAreaPartFromRegion()', () => {
    it('should throw an error if an invalid region was passed', () => {
      let errorMessage = '';

      try {
        regionHelper.getAreaPartFromRegion('pc-invalid');
      } catch (error) {
        errorMessage = error.message;
      }

      expect(errorMessage).to.be.equal('invalid region "pc-invalid"');
    });

    it('should throw an error if null was passed', () => {
      let errorMessage = '';

      try {
        regionHelper.getAreaPartFromRegion(null);
      } catch (error) {
        errorMessage = error.message;
      }

      expect(errorMessage).to.be.equal('invalid region "null"');
    });

    it('should throw an error if undefined was passed', () => {
      let errorMessage = '';

      try {
        regionHelper.getAreaPartFromRegion(undefined);
      } catch (error) {
        errorMessage = error.message;
      }

      expect(errorMessage).to.be.equal('invalid region "undefined"');
    });

    it('should return the area part of the region "pc-eu"', () => {
      const region = 'pc-eu';

      const result = regionHelper.getAreaPartFromRegion(region);

      expect(result).to.be.equal('eu');
    });

    it('should return the are part of the region "pc-kakao"', () => {
      const region = 'pc-kakao';

      const result = regionHelper.getAreaPartFromRegion(region);

      expect(result).to.be.equal('kakao');
    });

    it('should return the area part of the region "xbox-eu"', () => {
      const region = 'xbox-eu';

      const result = regionHelper.getAreaPartFromRegion(region);

      expect(result).to.be.equal('eu');
    });
  });
});
