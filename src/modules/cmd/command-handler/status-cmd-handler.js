const { CommandHandler } = require('./cmd-handler.js');

class StatusCommandHandler extends CommandHandler {
  handle(cmd, bot, db, pubg) {
    const { channelId } = cmd.discordUser;

    if (cmd.arguments.length !== 0) {
      this.onError(bot, cmd, 'invalid amount of arguments');
      return undefined;
    }

    return pubg.status()
      .then((data) => {
        const statusData = data.data;

        const { id } = statusData;
        const { releasedAt: releaseDate, version: apiVersion } = statusData.attributes;

        bot.sendMessage({
          to: channelId,
          message: StatusCommandHandler.getStatusMessage(id, apiVersion, releaseDate),
        });
      })

      .catch((error) => {
        this.onError(bot, cmd, error.message);
      });
  }

  static getStatusMessage(id, version, releasedAt) {
    return `\`\`\`
PUBG-API online!

ID:          ${id}
Version:     ${version}
Released at: ${releasedAt}\`\`\``;
  }
}

exports.getHandler = function getHandler() {
  return new StatusCommandHandler();
};
