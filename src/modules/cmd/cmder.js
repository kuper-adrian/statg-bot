const logger = require('../log').getLogger();

const { DiscordUser } = require('./discord-user.js');
const { Command } = require('./command.js');
const { CommandHandler } = require('./command-handler/cmd-handler');

const BASE_CMD = '!statg';
const AVAILABLE_COMMANDS = [
  'register',
  'stats',
  'version',
  'status',
  'help',
  'match',
  'unregister',
  'region',
];

// dictionary containing handler for all commands
const handler = {};
// fill dictionary
for (let i = 0; i < AVAILABLE_COMMANDS.length; i += 1) {
  const currentCommand = AVAILABLE_COMMANDS[i];
  const requirePath = `./command-handler/${currentCommand}-cmd-handler`;

  /* eslint global-require: "off", import/no-dynamic-require: "off" */
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
exports.processMessage = function processMessage(
  bot,
  db,
  pubg,
  username,
  userId,
  channelId,
  message,
) {
  if (message.length < BASE_CMD.length) return;

  // if message starts with '!statg'
  if (message.substring(0, BASE_CMD.length) === BASE_CMD) {
    logger.debug('---------------------------------');

    const user = new DiscordUser(userId, username, channelId);
    let args = message.substring(BASE_CMD.length).split(' ');

    // if no command was given, do nothing
    if (args.length < 2) {
      return;
    }

    const cmd = args[1];
    args = args.splice(2);

    logger.info(`Got command "${cmd}" by "${username}". Args: "${args}"`);

    const commandInfo = new Command(cmd, args, user);

    if (AVAILABLE_COMMANDS.includes(cmd)) {
      handler[commandInfo.command].handle(commandInfo, bot, db, pubg);
    } else {
      const errorHandler = new CommandHandler();
      errorHandler.onError(
        bot,
        commandInfo,
        new Error('Unknown command. Type```!statg help```to get more infos about all commands.'),
      );
    }
  }
};
