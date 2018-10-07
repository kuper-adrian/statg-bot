/**
 * Tries to find a registered player, falls back to the Discord name
 * @param {String} pubg PUBG API instance
 * @param {String} db Database instance
 * @param {String} discordUser Discord user instance
 */
exports.getPlayer = (pubg, db, discordUser) =>
  exports.getRegisteredPlayer(pubg, db, discordUser.id)

    .catch(() => exports.getPlayerByName(pubg, db, discordUser.name));

/**
 * Gets PUBG info about a registered player
 * @param {String} pubg PUBG API instance
 * @param {String} db Database instance
 * @param {String} discordId ID of the discord user
 */
exports.getRegisteredPlayer = (pubg, db, discordId) => {
  let pubgId = '';

  return db.getRegisteredPlayers({ discord_id: discordId })

    .then((rows) => {
      if (rows.length === 0) {
        return Promise.reject(new Error('Player not registered. Try register command first'));
      } else if (rows.length > 1) {
        return Promise.reject(new Error('Something really weird happened.'));
      }

      const player = rows[0];
      pubgId = player.pubg_id;

      return db.getRegions({ id: rows[0].region_id });
    })

    .then((rows) => {
      if (rows.length !== 1) {
        return Promise.reject(new Error('Something really weird happened.'));
      }

      return pubg.player({
        id: pubgId,
        region: rows[0].region_name,
      });
    })

    .then(data => data.data);
};

/**
 * Finds a PUBG player using the Discord account name
 * @param {String} pubg PUBG API instance
 * @param {String} db Database instance
 * @param {String} discordName Name of the discord user
 */
exports.getPlayerByName = (pubg, db, discordName) =>
  db.getRegions({ is_global_region: true })

    .then((rows) => {
      if (rows.length !== 1) {
        return Promise.reject(new Error('Something really weird happened.'));
      }

      return pubg.player({
        name: discordName,
        region: rows[0].region_name,
      });
    })

    .then(data => data.data[0]);
