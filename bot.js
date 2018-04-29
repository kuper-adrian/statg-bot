var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var https = require('https');

const PUBG_API_BASE_URL = "https://api.playbattlegrounds.com/shards/pc-eu/";
const PUBG_API_KEY = auth.pubgApiKey;

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client({
    token: auth.discordToken,
    autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];

        args = args.splice(1);
        switch (cmd) {
            // !ping
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong!'
                });
                break;

            case 'stats':
                bot.sendMessage({
                    to: channelID,
                    message: 'WarkMalberg: Kills: 0, Hitpoints: 0; justus9999: Kills: 10, Hitpoints: 100!'
                });
                break;

            case 'test':

                const options = {
                    hostname: 'api.playbattlegrounds.com',
                    path: '/shards/pc-eu/matches/b8aee556-5912-4f3d-8734-8fa297f5d544',
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + PUBG_API_KEY,
                        'Accept': 'application/vnd.api+json'
                    }
                };

                https.get(options, (resp) => {
                    let data = '';

                    // A chunk of data has been recieved.
                    resp.on('data', (chunk) => {
                        data += chunk;
                    });

                    // The whole response has been received. Print out the result.
                    resp.on('end', () => {
                        // console.log(JSON.parse(data).explanation);
                        
                        var apiData = JSON.parse(data);
                        logger.info('Loaded api data');

                        bot.sendMessage({
                            to: channelID,
                            message: data
                        });
                    });

                }).on("error", (err) => {
                    // console.log("Error: " + err.message);
                    logger.warn("Error: " + err.message);
                });

                break;
            // Just add any case commands if you want to..
        }
    }
});