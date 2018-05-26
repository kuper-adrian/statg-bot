const expect = require('chai').expect;
const sinon = require('sinon');
const fs = require('fs');

let auth = {};

function requireUncached(m){
    delete require.cache[require.resolve(m)]
    return require(m)
}

describe('auth.init()', () => {

    beforeEach(() => {
        auth = requireUncached('../src/auth');
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

    it('should use the auth.json if the "buildConfig" parameter is set to "debug"', () => {
        
        const cmdLineArguments = [
            "buildConfig=debug",
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

    it('should use the values passed by argument if "buildConfig" is set to "release"', () => {
        
        const discordToken = "some-test-token";
        const pubgApiKey = "some-test-api-key";

        const cmdLineArguments = [
            "buildConfig=release",
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

    it('should throw an error if the "buildConfig" argument was passed with an invalid value', () => {
        
        const cmdLineArguments = [
            "buildConfig=asd",
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

        expect(errorMessage).to.contain(`invalid build config "asd"`)
        expect(auth.discordToken).to.be.undefined;
        expect(auth.pubgApiKey).to.be.undefined;
    })

    it('should throw an error if an invalid argument was passed', () => {
        
        const cmdLineArguments = [
            "buildConfig=release",
            "discordToken=123",
            "pubgApiKey=asd",
            "invalid"
        ];

        // TODO
    })

    it('should throw an error if the "buildConfig" argument was passed without value', () => {
        
        const cmdLineArguments = [
            "buildConfig=",
            "discordToken=123",
            "pubgApiKey=asd"
        ];

        // TODO
    })

    it('should throw an error if the "discordToken" argument was without value', () => {
        
        const cmdLineArguments = [
            "buildConfig=release",
            "discordToken=",
            "pubgApiKey=asd"
        ];

        // TODO
    })

    it('should throw an error if the "pubgApiKey" argument was passed without value', () => {
        
        const cmdLineArguments = [
            "buildConfig=release",
            "discordToken=123",
            "pubgApiKey="
        ];

        // TODO
    })

    it('should throw an error if the "discordToken" argument was passed without the "pubgApiKey" argument', () => {
        
        const cmdLineArguments = [
            "buildConfig=release",
            "discordToken=123"
        ];

        // TODO
    })

    it('should throw an error if the "pubgApiKey" argument was passed without the "discordToken" argument', () => {
        
        const cmdLineArguments = [
            "buildConfig=release",
            "pubgApiKey=asd"
        ];

        // TODO
    })
});