const Discord = require('discord.io');
const auth = require('./auth.json');
const pubg = require('./modules/pubg');
const statgDb = require('./modules/db');
const logger = require('./modules/log').getLogger();
const cmder = require('./modules/cmd/cmder');

// Initialize Discord Bot
const bot = new Discord.Client({
    token: auth.discordToken,
    autorun: true
});

let initialized = false;

bot.on('ready', function (evt) {

    logger.info('Connected!');
    logger.debug('Logged in as: ');
    logger.debug(bot.username + ' - (' + bot.id + ')');

    statgDb.init()
        .then(() => {
            logger.info("start listening for messages...");
            initialized = true;
        })

        .catch(error => {

        })
});

bot.on('message', (user, userID, channelID, message, evt) => {

    // dont do anything if not everything was initialized in the background
    if (!initialized) return;

    try {
        cmder.processMessage(bot, statgDb, pubg, user, userID, channelID, message, evt);
    } catch (err) {
        logger.error(err);
    }
});

bot.on('error', error => {

    logger.info('bot.on("error")')
    logger.error(error);
});

bot.on('disconnect', event => {

    logger.info('bot.on("disconnect")')
    logger.warn(event);
});