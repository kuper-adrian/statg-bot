const expect = require('chai').expect;
const sinon = require('sinon');

const logger = require('../../../../src/modules/log').getLogger();
const StatsCommandHandler = require('../../../../src/modules/cmd/command-handler/stats-cmd-handler');

describe('StatsCommandHandler.handle()', () => {

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

    // ------------------------------------------------------------------------------------------
    // Tests
    // ------------------------------------------------------------------------------------------

    it('should get the pubg id for the discord user from the db', () => {
        // TODO
    });

    it('should throw an error if there is not player id for discord user in db', () => {
        // TODO
    })

    it('should request the seasons from pubg api after retrieving the id from db', () => {
        // TODO
    })

    it('should throw an error if multiple player ids are returned by db query', () => {
        // TODO
    })

    it('should request the stats for the given player id and current season', () => {
        // TODO
    });

    it('should return return the avg. stats for all game modes if no argument was passed to cmd', () => {
        // TODO
    });

    it('should return avg. stats for game mode "solo" when passed as argument', () => {
        // TODO
    });

    it('should return avg. stats for game mode "solo-fpp" when passed as argument', () => {
        // TODO
    });

    it('should return avg. stats for game mode "duo" when passed as argument', () => {
        // TODO
    });

    it('should return avg. stats for game mode "duo-fpp" when passed as argument', () => {
        // TODO
    });

    it('should return avg. stats for game mode "squad" when passed as argument', () => {
        // TODO
    });

    it('should return avg. stats for game mode "squad-fpp" when passed as argument', () => {
        // TODO
    });

    it('should throw an error if an invalid argument was passed', () => {
        // TODO
    });

    it('should throw an error if multiple arguments were passed', () => {
        // TODO
    });
});