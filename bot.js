var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var https = require('https');
var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var package = require('./package.json');

const DB_FILE_NAME = 'stat-g-db.db';

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

    // falls keine Datenbank-Datei vorhanden ist
    if (!fs.existsSync(DB_FILE_NAME)) {

        logger.info('No database file found. Create new database...');
        var db = new sqlite3.Database(DB_FILE_NAME);

        try {
            // Datenmodell erstellen
            db.serialize(function () {
                logger.info('Creating table \"registered_player\"...')
                db.run("CREATE TABLE registered_player (id INTEGER PRIMARY KEY, discord_name TEXT, discord_id TEXT, pubg_name TEXT, pubg_id TEXT)");
            });

            logger.info('Database created!');

        } catch (err) {

            logger.info('Database creation failed!')
        } finally {

            db.close();
        }
    }

    // TODO get max id of tables
});

bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];

        args = args.splice(1);

        logger.info('user: ' + user + ', userId: ' + userID + ', channelId: ' + channelID + ', evt: ' + evt)

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

                var options = {
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

            case 'register':

                var options = {
                    hostname: 'api.playbattlegrounds.com',
                    path: '/shards/pc-eu/players?filter[playerNames]=' + args,
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

                        var pubgPlayerData = JSON.parse(data).data[0];
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
                                message: 'Player \"' + args + '\" registered!'
                            });

                        } catch (err) {

                            logger.warn(err);
                            bot.sendMessage({
                                to: channelID,
                                message: 'Error on registering player: \"' + args + '\"'
                            });
                        } finally {
                            db.close();
                        }
                    });

                }).on("error", (err) => {
                    logger.warn("Error: " + err.message);
                    bot.sendMessage({
                        to: channelID,
                        message: 'Error on registering player: \"' + args + '\"'
                    });
                });

                
                break;
            case 'version':
                bot.sendMessage({
                    to: channelID,
                    message: 'Stat-G-Bot v' + package.version
                });
        }
    }
});