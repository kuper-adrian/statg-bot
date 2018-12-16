const BASE_URL = 'https://pubg.op.gg/user';

/**
 * Returns url to pubg.op.gg player profile for the given server region
 * @param {String} name Player name
 */
exports.getUrlForPlayer = (name) => {
  if (name === undefined || name === null) {
    throw new Error(`invalid player name "${name}"`);
  }
  return `${BASE_URL}/${name}`;
};
