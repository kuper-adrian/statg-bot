# StatG

[![Build Status](https://travis-ci.org/kuper-adrian/statg-bot.svg?branch=master)](https://travis-ci.org/kuper-adrian/statg-bot)

StatG is a discord bot that can post PUBG statistics in your discord channel!

**Disclaimer:** StatG is a hobby project for the purpose of learning JavaScript, Node.js, Docker, CI and CD. While the bot works and I personally use it, I can give no guarantees about reliabilty or further development. So use it with care ;)

## Commands

* `!statg register [pubg player name]` 
  Links your PUBG player name to your Discord account. Enables you to fetch your stats.
* `!statg stats` Shows your current season stats (if you have registered yourself). **Optional arguments** are:
    * `solo` Stats from third-person solo matches only.
    * `solo-fpp` Stats from first-person solo matches only.
    * `duo` Stats from third-person duo matches only.
    * `duo-fpp` Stats from first-person duo matches only.
    * `squad` Stats from third-person squad matches only.
    * `squad-fpp` Stats from first-person squad matches only.
* `!statg match`
  Shows your and your squads latest match info (all game modes combined).
* `!statg help`
  Displays help about commands.
* `!statg version`
  Displays version of the stat-g bot.
* `!statg status`
  Displays the current status of the PUBG api.
* `!statg ping`
  Pong!

## Installation

To run the bot locally on your machine, you will need:

 - Node.js ([Download-Link](https://nodejs.org/en/))
 - A PUBG API key (obtainable from [here](https://developer.playbattlegrounds.com/))
 - A discord bot token + client id (get them [here](https://discordapp.com/login?redirect_to=/developers/applications/me))
 - Add the bot to your server by opening the following link and logging in
 ```
 https://discordapp.com/oauth2/authorize?&client_id=YOUR_CLIENT_ID&scope=bot&permissions=0
 ```
 (replace `YOUR_CLIENT_ID` with the client id of your bot)

**IMPORTANT:** Keep the discord token and pubg api key secret.

After that, everything else is straightforward:
1. Clone this repo or download it as `.zip`-file and unpack it to a folder of your liking
2. Open a terminal and navigate to the project folder
3. Run the bot with the command
```
node ./src/bot.js discordToken=TOKEN_HERE pubgApiKey=API_KEY_HERE
```
(replace `TOKEN_HERE` and `API_KEY_HERE` with the respective values)

## License
MIT