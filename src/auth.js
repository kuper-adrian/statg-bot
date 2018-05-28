/**
 * Module that manages the pubg api key and the discord bot token based on 
 * the "runConfig" command line parameter passed to launch the bot.
 * 
 * No value or the value of "debug" attempts to get the values from a
 * "auth.json" file.
 * 
 * The value of "release" will attempt to get the values from the command
 * line parameters "discordToken" and "pubgApiKey".
 */

const fs = require('fs');
const logger = require('./modules/log').getLogger();

const RUN_CONFIG_ARG_NAME = "runConfig="
const DISCORD_TOKEN_ARG_NAME = "discordToken="
const PUBG_API_KEY_ARG_NAME = "pubgApiKey="

const RUN_CONFIGS = [
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

    // remove "runConfig=" and return value
    return cmdLineArg[0].replace(name, "")
}

/**
 * 
 * @param {Array} cmdLineArgs 
 */
exports.init = function(cmdLineArgs) {

    if (cmdLineArgs === undefined || cmdLineArgs === null) {
        throw new Error("no command arguments given");
    }

    if (cmdLineArgs.length === 0) {
        throw new Error("no command arguments given");
    }

    const invalidArgs = cmdLineArgs.filter((arg) => {
        return !(arg.includes(RUN_CONFIG_ARG_NAME) || 
            arg.includes(DISCORD_TOKEN_ARG_NAME) ||
            arg.includes(PUBG_API_KEY_ARG_NAME));
    });

    if (invalidArgs.length > 0) {
        throw new Error(`invalid argument "${invalidArgs[0]}"`)
    }

    const runConfig = getCommandLineArgument(RUN_CONFIG_ARG_NAME, cmdLineArgs);
    const discordToken = getCommandLineArgument(DISCORD_TOKEN_ARG_NAME, cmdLineArgs);
    const pubgApiKey = getCommandLineArgument(PUBG_API_KEY_ARG_NAME, cmdLineArgs);

    // if runConfig is null, it will be handled as "release"
    if (!RUN_CONFIGS.includes(runConfig) && runConfig !== null) {
        throw new Error(`invalid run config "${runConfig}"`)
    }

    if (runConfig === "debug") {
        setExports(readAuthJson());
        return;
    } 
    
    if (discordToken === null || pubgApiKey === null) {
        throw new Error(`when using "release" run config both "discordToken" and "pubgApiKey" have to be specified`);
    }

    if (discordToken === "") {
        throw new Error(`invalid value "" for argument "discordToken"`)
    }
    if (pubgApiKey === "") {
        throw new Error(`invalid value "" for argument "pubgApiKey"`)
    }

    logger.info("using secrets passed by command line")
    setExports({
        discordToken: discordToken,
        pubgApiKey: pubgApiKey
    });
}