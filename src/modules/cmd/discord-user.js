
class DiscordUser {

    /**
     * Model class to temporary store infos about a discord user.
     * 
     * @param {string} id Discord ID of user
     * @param {string} name Discord name of user
     * @param {string} channelId Id of the channel the user posted
     */
    constructor (id, name, channelId) {
        this.id = id;
        this.name = name;
        this.channelId = channelId;
    }
}

exports.DiscordUser = DiscordUser