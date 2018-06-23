const BASE_URL = 'https://pubg.op.gg/user';

/**
 * Returns url to pubg.op.gg player profile for the given server region
 * @param {String} name Player name
 * @param {String} regionArea Server area of the region
 */
exports.getUrlForPlayer = (name, regionArea) => {
  if (name === undefined || name === null) {
    throw new Error(`invalid player name "${name}"`);
  }
  if (regionArea === undefined || regionArea === null) {
    throw new Error(`invalid server "${regionArea}"`);
  }

  return `${BASE_URL}/${name}?server=${regionArea}`;
};
