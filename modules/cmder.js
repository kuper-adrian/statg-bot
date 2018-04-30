var logger = require('./log').getLogger();

const BASE_CMD = '!statg';
const AVAILABLE_COMMANDS = {
    default: "default",
    register: "register",
    stats: "stats",
    version: "version",
    status: "status",
    region: "region",
    help: "help"
}

function Command(cmd, args) {
    this.command = cmd;
    this.arguments = args;
    return this;
}

exports.commands = AVAILABLE_COMMANDS;

exports.getCommand = function (user, userID, channelID, message, evt) {
    
    // if message starts with "!statg"
    if (message.substring(0, BASE_CMD.length) === BASE_CMD) {
        
        var args = message.substring(BASE_CMD.length).split(' ');

        // if no command was given, do nothing
        if (args.length === 0) {
            return null;
        }        
        if (args.length === 1) {           
            return new Command(AVAILABLE_COMMANDS.default, []);
        } 

        var cmd = args[1];
        args = args.splice(2);

        logger.info('Got command \"' + cmd + '\" by \"' + user + '\". Args: ' + args);
        logger.debug('user: ' + user + ', userId: ' + userID + ', channelId: ' + channelID + ', evt: ' + evt);

        return new Command(cmd, args);
    }
}