exports.getPlayer = (pubg, db, discordUser) =>
  exports.getRegisteredPlayer(pubg, db, discordUser.id)

    .catch(() => exports.getPlayerByName(pubg, db, discordUser.name));

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
