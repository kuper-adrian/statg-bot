const REGIONS = [
  'pc-na',
  'pc-eu',
  'pc-ru',
  'pc-oc',
  'pc-kakao',
  'pc-sea',
  'pc-sa',
  'pc-as',
  'pc-jp',
  'pc-krjp',
  'xbox-as',
  'xbox-eu',
  'xbox-na',
  'xbox-oc',
];

/**
 * Returns the area of the given region.
 *
 * Eg. return "eu" for region "pc-eu".
 * @param {String} region Region
 */
exports.getAreaPartFromRegion = (region) => {
  if (region === undefined || region === null || !REGIONS.includes(region)) {
    throw new Error(`invalid region "${region}"`);
  }
  return region.split('-')[1];
};

/**
 * Returns the platform part for the given region
 *
 * Eg. returns "pc" for region "pc-eu".
 * @param {String} region Region
 */
exports.getPlatformFromRegion = (region) => {
  if (region === undefined || region === null || !REGIONS.includes(region)) {
    throw new Error(`invalid region "${region}"`);
  }
  return region.split('-')[0];
};

exports.REGIONS = REGIONS;
