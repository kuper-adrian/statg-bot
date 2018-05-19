const DiscordUser = require('./discord-user').DiscordUser


class Command {
    
    /**
     * 
     * @param {string} cmd Command as string
     * @param {string[]} args Array of string arguments
     * @param {DiscordUser} discordUser discord user that issued the command
     */
    constructor (cmd, args, discordUser) {
        this.command = cmd;
        this.arguments = args;
        this.discordUser = discordUser;
    }
}

exports.Command = Command;