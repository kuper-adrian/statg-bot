const { CommandHandler } = require('./cmd-handler.js');

class StatusCommandHandler extends CommandHandler {
  handle(cmd, bot, db, pubg) {
    if (cmd.arguments.length !== 0) {
      this.onError(bot, cmd, new Error('invalid amount of arguments'));
      return undefined;
    }

    return pubg.status()
      .then(() => {
        this.onSuccess(bot, cmd, 'Looks like the PUBG API is up and ready!');
      })

      .catch((error) => {
        this.onError(bot, cmd, error);
      });
  }
}

exports.getHandler = function getHandler() {
  return new StatusCommandHandler();
};
