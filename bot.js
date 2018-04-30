var Discord = require('discord.io');
var https = require('https');
var fs = require('fs');

var auth = require('./auth.json');
var package = require('./package.json');
var pubg = require('./modules/pubg');
var statgDb = require('./modules/db/db');
var logger = require('./modules/log').getLogger();
var cmder = require('./modules/cmder');


// Initialize Discord Bot
var bot = new Discord.Client({
    token: auth.discordToken,
    autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');

    statgDb.createDb();

    logger.info("start listening for messages...");
});

bot.on('message', function (user, userID, channelID, message, evt) {

    var cmd = cmder.getCommand(user, userID, channelID, message, evt);
    if (cmd === undefined || cmd == null) return;

    // run everything in try-catch-block to prevent the bot 
    // from crashing if a strange error occures
    try {

        switch (cmd.command) {
            // ---------------------------------------------------------------------------------------------------------------
            // REGISTER
            // ---------------------------------------------------------------------------------------------------------------
            case cmder.commands.register:

                var playerName = cmd.arguments[0];

                pubg.playerByName({
                    name: playerName,
                    success: function (data) {

                        var pubgPlayerData = data.data[0];

                        statgDb.registered_player.create(userID, user, pubgPlayerData.id, pubgPlayerData.attributes.name);

                        bot.sendMessage({
                            to: channelID,
                            message: 'Player \"' + playerName + '\" registered!'
                        });
                    },
                    error: function (err) {
                        logger.warn(err);
                        bot.sendMessage({
                            to: channelID,
                            message: 'Error on registering player: \"' + playerName + '\"'
                        });
                    }
                });

                break;

            case cmder.commands.version:
                bot.sendMessage({
                    to: channelID,
                    message: 'Stat-G-Bot v' + package.version
                });
                break;

            // ---------------------------------------------------------------------------------------------------------------
            // STATISTICS
            // ---------------------------------------------------------------------------------------------------------------
            case cmder.commands.stats:

                

                break;
            // ---------------------------------------------------------------------------------------------------------------
            // STATUS
            // ---------------------------------------------------------------------------------------------------------------
            case cmder.commands.status:
                bot.sendMessage({
                    to: channelID,
                    message: 'TODO: get pubg api status'
                });
                break;

            // ---------------------------------------------------------------------------------------------------------------
            // REGION
            // ---------------------------------------------------------------------------------------------------------------
            case cmder.commands.region:
                bot.sendMessage({
                    to: channelID,
                    message: 'TODO: set api region of bot'
                });
                break;

            // ---------------------------------------------------------------------------------------------------------------
            // HELP
            // ---------------------------------------------------------------------------------------------------------------
            case cmder.commands.help:

                bot.sendMessage({
                    to: channelID,
                    message: 'TODO: display help'
                });
                
                break;

            default:
                break;
        } // end switch (cmd.command)

    } catch (err) {

        logger.error(err);
    }
});