var Discord = require('discord.io');
var logger = require('winston');
var https = require('https');
var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');

var auth = require('./auth.json');
var package = require('./package.json');
var pubg = require('./modules/pubg');
var db = require('./modules/db');

const BASE_CMD = '!statg';

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
    if (message.substring(0, BASE_CMD.length) === BASE_CMD) {
        var args = message.substring(BASE_CMD.length).split(' ');


        if (args.length === 0) {
            return;
        }
        else if (args.length === 1) {
            // default verwenden


            return;
        }

        var cmd = args[1];

        args = args.splice(2);

        logger.info('user: ' + user + ', userId: ' + userID + ', channelId: ' + channelID + ', evt: ' + evt);

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
                    message: 'WarkMahlberg: Kills: 0, Hitpoints: 0; justus9999: Kills: 10, Hitpoints: 100, TheThad: Kills: 1, Hitpoints: 15'
                });
                break;

            case 'test':

                break;

            case 'register':

                var playerName = args;


                pubg.playerByName({
                    name: playerName,
                    success: function (data) {

                        // log errors
                        if (data.errors !== undefined && data.errors.length !== 0) {
                            
                            for (var i = 0; i < data.errors.length; i++) {
                                logger.warn(data.errors[i]);
                            }
                            
                            bot.sendMessage({
                                to: channelID,
                                message: 'Error on registering player: \"' + playerName + '\"'
                            });
                            return;
                        }

                        var pubgPlayerData = data.data[0];
                        logger.info('Loaded api data');

                        var db = new sqlite3.Database(DB_FILE_NAME);
                        try {
                            
                            db.serialize(function () {

                                var stmt = db.prepare("INSERT INTO registered_player (discord_name, discord_id, pubg_name, pubg_id) VALUES (?, ?, ?, ?)");
                                stmt.run(user, userID, pubgPlayerData.attributes.name, pubgPlayerData.id);
                                stmt.finalize();
                            });
                            
                            bot.sendMessage({
                                to: channelID,
                                message: 'Player \"' + playerName + '\" registered!'
                            });

                        } catch (err) {

                            logger.warn(err);
                            bot.sendMessage({
                                to: channelID,
                                message: 'Error on registering player: \"' + playerName + '\"'
                            });
                        } finally {
                            db.close();
                        }
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
            case 'version':
                bot.sendMessage({
                    to: channelID,
                    message: 'Stat-G-Bot v' + package.version
                });

            case 'status':

                
                break;
        }
    }
});