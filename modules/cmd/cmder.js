var logger = require('../log').getLogger();

const BASE_CMD = '!statg';
const AVAILABLE_COMMANDS = [
    //"default",
    "register",
    //"stats",
    "version",
    "status",
    //"region",
    "help"
];

var handler = {}

for (var i = 0; i < AVAILABLE_COMMANDS.length; i++) {
        
    var currentCommand = AVAILABLE_COMMANDS[i];
    var requirePath = './command-handler/' + currentCommand + '-cmd-handler';

    handler[currentCommand] = require(requirePath)
}

function DiscordUser(id, name, channelId) {
    this.id = id;
    this.name = name;
    this.channelId = channelId;
    return this;
}

function Command(cmd, args, discordUser) {
    this.command = cmd;
    this.arguments = args;
    this.discordUser = discordUser;
    return this;
}

exports.processMessage = function (bot, db, pubg, username, userID, channelID, message, evt) {
    
    // if message starts with "!statg"
    if (message.substring(0, BASE_CMD.length) === BASE_CMD) {
        
        var user = new DiscordUser(userID, username, channelID);
        var args = message.substring(BASE_CMD.length).split(' ');

        // if no command was given, do nothing
        if (args.length === 0) {
            return null;
        }        
        if (args.length === 1) {           
            return new Command(AVAILABLE_COMMANDS.default, [], user);
        } 

        var cmd = args[1];
        args = args.splice(2);

        logger.info('Got command \"' + cmd + '\" by \"' + username + '\". Args: ' + args);
        logger.debug('user: ' + username + ', userId: ' + userID + ', channelId: ' + channelID + ', evt: ' + evt);

        var commandInfo = new Command(cmd, args, user);

        handler[commandInfo.command].handle(commandInfo, bot, db, pubg)
    }
}