const expect = require('chai').expect;
const sinon = require('sinon');
const fs = require('fs');
const logger = require('../src/modules/log').getLogger();

let auth = {};

function requireUncached(m){
    delete require.cache[require.resolve(m)]
    return require(m)
}

describe('auth.init()', () => {

    let debugStub = {};
    let infoStub = {};
    let warnStub = {};
    let errorStub = {};

    beforeEach(() => {
        auth = requireUncached('../src/auth');

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

    it('should use the auth.json file if no command line parameters were given', () => {
        
        const cmdLineArguments = [];

        const discordToken = "some-test-token";
        const pubgApiKey = "some-test-api-key";

        const readFileSyncStub = sinon.stub(fs, "readFileSync").callsFake((path) => {
            return JSON.stringify({
                discordToken: discordToken,
                pubgApiKey: pubgApiKey
            });
        })

        auth.init(cmdLineArguments);

        sinon.assert.calledOnce(readFileSyncStub);
        fs.readFileSync.restore();

        expect(auth.discordToken).to.be.equal(discordToken);
        expect(auth.pubgApiKey).to.be.equal(pubgApiKey);
    });

    it('should use the auth.json if the cmdLineArguments parameter is null', () => {

        const cmdLineArguments = null;

        const discordToken = "some-test-token";
        const pubgApiKey = "some-test-api-key";

        const readFileSyncStub = sinon.stub(fs, "readFileSync").callsFake((path) => {
            return JSON.stringify({
                discordToken: discordToken,
                pubgApiKey: pubgApiKey
            });
        });

        auth.init(cmdLineArguments);

        sinon.assert.calledOnce(readFileSyncStub);
        fs.readFileSync.restore();

        expect(auth.discordToken).to.be.equal(discordToken);
        expect(auth.pubgApiKey).to.be.equal(pubgApiKey);
    });

    it('should use the auth.json if the cmdLineArguments parameter is undefined', () => {
        
        const discordToken = "some-test-token";
        const pubgApiKey = "some-test-api-key";

        const readFileSyncStub = sinon.stub(fs, "readFileSync").callsFake((path) => {
            return JSON.stringify({
                discordToken: discordToken,
                pubgApiKey: pubgApiKey
            });
        })

        auth.init();

        sinon.assert.calledOnce(readFileSyncStub);
        fs.readFileSync.restore();

        expect(auth.discordToken).to.be.equal(discordToken);
        expect(auth.pubgApiKey).to.be.equal(pubgApiKey);
    });

    it('should not contain any values for discord token and the api key before init() is called', () => {
        
        const cmdLineArguments = [];

        expect(auth.discordToken).to.be.undefined;
        expect(auth.pubgApiKey).to.be.undefined;
    });

    it('should use the auth.json if the "runConfig" parameter is set to "debug"', () => {
        
        const cmdLineArguments = [
            "runConfig=debug",
            "discordToken=123",
            "pubgApiKey=asd"
        ];

        const discordToken = "some-test-token";
        const pubgApiKey = "some-test-api-key";

        const readFileSyncStub = sinon.stub(fs, "readFileSync").callsFake((path) => {
            return JSON.stringify({
                discordToken: discordToken,
                pubgApiKey: pubgApiKey
            });
        })

        auth.init(cmdLineArguments);

        sinon.assert.calledOnce(readFileSyncStub);
        fs.readFileSync.restore();

        expect(auth.discordToken).to.be.equal(discordToken);
        expect(auth.pubgApiKey).to.be.equal(pubgApiKey);
    });

    it('should use the values passed by argument if "runConfig" is set to "release"', () => {
        
        const discordToken = "some-test-token";
        const pubgApiKey = "some-test-api-key";

        const cmdLineArguments = [
            "runConfig=release",
            `discordToken=${discordToken}`,
            `pubgApiKey=${pubgApiKey}`
        ];

        
        const readFileSyncStub = sinon.stub(fs, "readFileSync").callsFake((path) => {
            return JSON.stringify({
                discordToken: "some-other-token",
                pubgApiKey: "some-other-key"
            });
        })

        auth.init(cmdLineArguments);

        sinon.assert.notCalled(readFileSyncStub);
        fs.readFileSync.restore();

        expect(auth.discordToken).to.be.equal(discordToken);
        expect(auth.pubgApiKey).to.be.equal(pubgApiKey);
    })

    it('should throw an error if the "runConfig" argument was passed with an invalid value', () => {
        
        const cmdLineArguments = [
            "runConfig=asd",
            "discordToken=123",
            "pubgApiKey=asd"
        ];

        const readFileSyncStub = sinon.stub(fs, "readFileSync").callsFake((path) => {
            return JSON.stringify({
                discordToken: "some-other-token",
                pubgApiKey: "some-other-key"
            });
        })

        let errorMessage = '';

        try {
            auth.init(cmdLineArguments);
        } catch (error) {
            errorMessage = error.message;
        }

        sinon.assert.notCalled(readFileSyncStub);
        fs.readFileSync.restore();

        expect(errorMessage).to.contain(`invalid run config "asd"`)
        expect(auth.discordToken).to.be.undefined;
        expect(auth.pubgApiKey).to.be.undefined;
    })

    it('should throw an error if an invalid argument was passed', () => {
        
        const cmdLineArguments = [
            "runConfig=release",
            "discordToken=123",
            "pubgApiKey=asd",
            "invalid"
        ];

        const readFileSyncStub = sinon.stub(fs, "readFileSync").callsFake((path) => {
            return JSON.stringify({
                discordToken: "some-other-token",
                pubgApiKey: "some-other-key"
            });
        })

        let errorMessage = '';

        try {
            auth.init(cmdLineArguments);
        } catch (error) {
            errorMessage = error.message;
        }

        sinon.assert.notCalled(readFileSyncStub);
        fs.readFileSync.restore();

        expect(errorMessage).to.contain(`invalid argument "invalid"`)
        expect(auth.discordToken).to.be.undefined;
        expect(auth.pubgApiKey).to.be.undefined;
    })

    it('should throw an error if the "runConfig" argument was passed without value', () => {
        
        const cmdLineArguments = [
            "runConfig=",
            "discordToken=123",
            "pubgApiKey=asd"
        ];

        const readFileSyncStub = sinon.stub(fs, "readFileSync").callsFake((path) => {
            return JSON.stringify({
                discordToken: "some-other-token",
                pubgApiKey: "some-other-key"
            });
        })

        let errorMessage = '';

        try {
            auth.init(cmdLineArguments);
        } catch (error) {
            errorMessage = error.message;
        }

        sinon.assert.notCalled(readFileSyncStub);
        fs.readFileSync.restore();

        expect(errorMessage).to.contain(`invalid run config ""`)
        expect(auth.discordToken).to.be.undefined;
        expect(auth.pubgApiKey).to.be.undefined;
    })

    it('should throw an error if the "discordToken" argument was without value', () => {
        
        const cmdLineArguments = [
            "runConfig=release",
            "discordToken=",
            "pubgApiKey=asd"
        ];

        const readFileSyncStub = sinon.stub(fs, "readFileSync").callsFake((path) => {
            return JSON.stringify({
                discordToken: "some-other-token",
                pubgApiKey: "some-other-key"
            });
        })

        let errorMessage = '';

        try {
            auth.init(cmdLineArguments);
        } catch (error) {
            errorMessage = error.message;
        }

        sinon.assert.notCalled(readFileSyncStub);
        fs.readFileSync.restore();

        expect(errorMessage).to.contain(`invalid value "" for argument "discordToken"`)
        expect(auth.discordToken).to.be.undefined;
        expect(auth.pubgApiKey).to.be.undefined;
    })

    it('should throw an error if the "pubgApiKey" argument was passed without value', () => {
        
        const cmdLineArguments = [
            "runConfig=release",
            "discordToken=123",
            "pubgApiKey="
        ];

        const readFileSyncStub = sinon.stub(fs, "readFileSync").callsFake((path) => {
            return JSON.stringify({
                discordToken: "some-other-token",
                pubgApiKey: "some-other-key"
            });
        })

        let errorMessage = '';

        try {
            auth.init(cmdLineArguments);
        } catch (error) {
            errorMessage = error.message;
        }

        sinon.assert.notCalled(readFileSyncStub);
        fs.readFileSync.restore();

        expect(errorMessage).to.contain(`invalid value "" for argument "pubgApiKey"`)
        expect(auth.discordToken).to.be.undefined;
        expect(auth.pubgApiKey).to.be.undefined;
    })

    it('should throw an error if the "discordToken" argument was passed without the "pubgApiKey" argument', () => {
        
        const cmdLineArguments = [
            "runConfig=release",
            "discordToken=123"
        ];

        const readFileSyncStub = sinon.stub(fs, "readFileSync").callsFake((path) => {
            return JSON.stringify({
                discordToken: "some-other-token",
                pubgApiKey: "some-other-key"
            });
        })

        let errorMessage = '';

        try {
            auth.init(cmdLineArguments);
        } catch (error) {
            errorMessage = error.message;
        }

        sinon.assert.notCalled(readFileSyncStub);
        fs.readFileSync.restore();

        expect(errorMessage).to.contain(`discordToken`)
        expect(errorMessage).to.contain(`pubgApiKey`)
        expect(errorMessage).to.contain(`have to be specified`)
        expect(auth.discordToken).to.be.undefined;
        expect(auth.pubgApiKey).to.be.undefined;
    })

    it('should throw an error if the "pubgApiKey" argument was passed without the "discordToken" argument', () => {
        
        const cmdLineArguments = [
            "runConfig=release",
            "pubgApiKey=asd"
        ];

        const readFileSyncStub = sinon.stub(fs, "readFileSync").callsFake((path) => {
            return JSON.stringify({
                discordToken: "some-other-token",
                pubgApiKey: "some-other-key"
            });
        })

        let errorMessage = '';

        try {
            auth.init(cmdLineArguments);
        } catch (error) {
            errorMessage = error.message;
        }

        sinon.assert.notCalled(readFileSyncStub);
        fs.readFileSync.restore();

        expect(errorMessage).to.contain(`discordToken`)
        expect(errorMessage).to.contain(`pubgApiKey`)
        expect(errorMessage).to.contain(`have to be specified`)
        expect(auth.discordToken).to.be.undefined;
        expect(auth.pubgApiKey).to.be.undefined;
    })
});