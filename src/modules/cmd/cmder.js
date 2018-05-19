var logger = require('../log').getLogger();

const DiscordUser = require('./discord-user.js').DiscordUser;
const Command = require('./command.js').Command;

const BASE_CMD = '!statg';
const AVAILABLE_COMMANDS = [
    //"default",
    "register",
    "stats",
    "version",
    "status",
    "region",
    "help",
    "match",
    "ping"
];

var handler = {}

for (var i = 0; i < AVAILABLE_COMMANDS.length; i++) {
        
    var currentCommand = AVAILABLE_COMMANDS[i];
    var requirePath = './command-handler/' + currentCommand + '-cmd-handler';

    handler[currentCommand] = require(requirePath).getHandler();
}

/**
 * 
 * @param {Object} bot 
 * @param {Object} db 
 * @param {Object} pubg 
 * @param {string} username 
 * @param {string} userID 
 * @param {string} channelID 
 * @param {string} message 
 * @param {Object} evt 
 */
exports.processMessage = function (bot, db, pubg, username, userID, channelID, message, evt) {
    
    if (message.length < BASE_CMD.length) return;

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


        if (AVAILABLE_COMMANDS.includes(cmd)) {
            var commandInfo = new Command(cmd, args, user);
            handler[commandInfo.command].handle(commandInfo, bot, db, pubg)
        } else {

            bot.sendMessage({
                to: channelID,
                message: 'Unknown command. Type "!statg help" to get more infos about all commands.'
            });
        } 
    }
}