const logger = require('../log').getLogger();

const DiscordUser = require('./discord-user.js').DiscordUser;
const Command = require('./command.js').Command;

const BASE_CMD = '!statg';
const AVAILABLE_COMMANDS = [
    "register",
    "stats",
    "version",
    "status",
    "help",
    "match",
    "ping",
    "unregister",
    "region"
    // TODO "mode"
];

// dictionary containing handler for all commands
const handler = {}
// fill dictionary
for (var i = 0; i < AVAILABLE_COMMANDS.length; i++) {
        
    var currentCommand = AVAILABLE_COMMANDS[i];
    var requirePath = './command-handler/' + currentCommand + '-cmd-handler';

    handler[currentCommand] = require(requirePath).getHandler();
}

/**
 * Processes the message of a discord user and handles statg commands
 * using the respective handler.
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
exports.processMessage = function (bot, db, pubg, username, userId, channelId, message, evt) {
    
    if (message.length < BASE_CMD.length) return;

    // if message starts with "!statg"
    if (message.substring(0, BASE_CMD.length) === BASE_CMD) {

        logger.debug("---------------------------------");
        
        let user = new DiscordUser(userId, username, channelId);
        let args = message.substring(BASE_CMD.length).split(' ');

        // if no command was given, do nothing
        if (args.length < 2) {
            return;
        }

        const cmd = args[1];
        args = args.splice(2);

        logger.info('Got command \"' + cmd + '\" by \"' + username + '\". Args: ' + args);
        logger.debug('user: ' + username + ', userId: ' + userId + ', channelId: ' + channelId + ', evt: ' + evt);

        if (AVAILABLE_COMMANDS.includes(cmd)) {
            const commandInfo = new Command(cmd, args, user);
            handler[commandInfo.command].handle(commandInfo, bot, db, pubg)
        } else {
            bot.sendMessage({
                to: channelId,
                message: 'Unknown command. Type "!statg help" to get more infos about all commands.'
            });
        } 
    }
}