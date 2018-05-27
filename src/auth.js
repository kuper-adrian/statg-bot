/**
 * Module that manages the pubg api key and the discord bot token based on 
 * the "--buildConfig" command line parameter passed to launch the bot.
 * 
 * No value or the value of "debug" attempts to get the values from a
 * "auth.json" file.
 * 
 * The value of "release" will attempt to get the values from the command
 * line parameters "--discordToken" and "--pubgApiKey".
 */

const fs = require('fs');
const logger = require('./modules/log').getLogger();

const BUILD_CONFIG_ARG_NAME = "buildConfig="
const DISCORD_TOKEN_ARG_NAME = "discordToken="
const PUBG_API_KEY_ARG_NAME = "pubgApiKey="

const BUILD_CONFIGS = [
    "release",
    "debug"
]

function readAuthJson(path) {
    logger.warn("trying to read secrets from local json file!")

    const authJson = fs.readFileSync(__dirname + "/auth.json");
    return JSON.parse(authJson);
}

function setExports(values) {
    exports.pubgApiKey = values.pubgApiKey;
    exports.discordToken = values.discordToken;
}

function getCommandLineArgument(name, cmdLineArgs) {

    let cmdLineArg = cmdLineArgs.filter((arg) => {
        return arg.includes(name);
    });

    if (cmdLineArg.length === 0) {
        return null;
    }

    // remove "buildConfig=" and return value
    return cmdLineArg[0].replace(name, "")
}

/**
 * 
 * @param {Array} cmdLineArgs 
 */
exports.init = function(cmdLineArgs) {

    if (cmdLineArgs === undefined || cmdLineArgs === null) {
        setExports(readAuthJson());
        return;
    }

    if (cmdLineArgs.length === 0) {
        setExports(readAuthJson());
        return;
    }

    const buildConfig = getCommandLineArgument(BUILD_CONFIG_ARG_NAME, cmdLineArgs);

    if (buildConfig === null) {
        setExports(readAuthJson());
        return;
    }

    if (!BUILD_CONFIGS.includes(buildConfig)) {
        throw new Error(`invalid build config "${buildConfig}"`)
    }

    if (buildConfig === "debug") {
        setExports(readAuthJson());
        return;
    }

    const discordToken = getCommandLineArgument(DISCORD_TOKEN_ARG_NAME, cmdLineArgs);
    const pubgApiKey = getCommandLineArgument(PUBG_API_KEY_ARG_NAME, cmdLineArgs);

    if (discordToken === null || pubgApiKey === null) {
        throw new Error(`when using "release" build config both "discordToken" and "pubgApiKey" have to be specified`);
    }

    logger.info("using secrets passed by command line")
    setExports({
        discordToken: discordToken,
        pubgApiKey: pubgApiKey
    });
}