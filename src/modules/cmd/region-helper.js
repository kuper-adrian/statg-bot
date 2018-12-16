const pubgRoyale = require('pubg-royale');

const REGIONS = [];

function populateRegionsArray() {
  Object.keys(pubgRoyale.REGIONS.PC).forEach((element) => {
    REGIONS.push(pubgRoyale.REGIONS.PC[element]);
  });
}
populateRegionsArray();

exports.REGIONS = REGIONS;
