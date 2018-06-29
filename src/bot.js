const Discord = require('discord.io');
const PubgRoyale = require('pubg-royale');

const statgDb = require('./modules/db');
const logger = require('./modules/log').getLogger();
const cmder = require('./modules/cmd/cmder');

const auth = require('./auth');

let initialized = false;

// initialize auth info from command line parameters
try {
  process.argv.splice(0, 2);
  auth.init(process.argv);
} catch (error) {
  logger.error(error.message);
  process.exit();
}

// initialize pubg royale
const pubg = new PubgRoyale.Client({
  key: auth.pubgApiKey,
  defaultRegion: PubgRoyale.REGIONS.PC.EU,
  cache: {
    player: 120 * 1000,
    playerStats: 600 * 1000,
    status: 60 * 1000,
    seasons: 3600 * 1000,
    match: 300 * 1000,
  },
});

// Initialize Discord Bot
const bot = new Discord.Client({
  token: auth.discordToken,
  autorun: true,
});

bot.on('ready', () => {
  logger.info('Connected!');
  logger.debug('Logged in as: ');
  logger.debug(`${bot.username} - (${bot.id})`);

  statgDb.init()
    .then(() => {
      logger.info('start listening for messages...');
      initialized = true;
    })

    .catch(error => logger.error(error.message));
});

bot.on('message', (user, userID, channelID, message, evt) => {
  // dont do anything if not everything was initialized in the background
  if (!initialized) return;

  try {
    cmder.processMessage(bot, statgDb, pubg, user, userID, channelID, message, evt);
  } catch (err) {
    logger.error(err.message);
  }
});

bot.on('error', (error) => {
  logger.info('bot.on("error")');
  logger.error(error.message);
});

bot.on('disconnect', (event) => {
  logger.info('bot.on("disconnect")');
  logger.warn(event);
});
