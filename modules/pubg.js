/**
 * @module PubgApi
 */

var auth = require('../auth.json');
var https = require('https');

const PUBG_API_HOST_NAME = "api.playbattlegrounds.com";
const PUBG_API_KEY = auth.pubgApiKey;

function ApiError(exception, apiErrors) {
    this.exception = exception;
    this.apiErrors = apiErrors;
}

function getApiOptions(path) {
    return {
        hostname: PUBG_API_HOST_NAME,
        path: path,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + PUBG_API_KEY,
            'Accept': 'application/vnd.api+json'
        }
    }
}

/**
 * 
 * @param {Object} options Request options object
 * @param {Function} resolve Callback that is called, when the api request succeeded
 * @param {Function} reject Callback that is called, when an error occures
 */
function apiRequest(options, resolve, reject) {


    https.get(options, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            var apiData  = JSON.parse(data);


            if (apiData.errors !== undefined && apiData.errors.length > 0) {               
                reject(new ApiError(null, apiData.errors));
            }
            resolve(apiData);
        });
    }).on("error", (err) => {
        
        reject(new ApiError(err, null));
    });
}

/**
 * 
 * @param {Object} config 
 */
exports.playerByName = function (config) {

    var name = config.name;
    var success = config.success;
    var error = config.error;

    var options = getApiOptions('/shards/pc-eu/players?filter[playerNames]=' + name);
    return apiRequest(options, success, error);
};

exports.playerById = function (config) {

    var id = config.id;
    var success = config.success;
    var error = config.error;

    var options = getApiOptions('/shards/pc-eu/players/' + id);
    return apiRequest(options, success, error);
};

exports.status = function (config) {

    var success = config.success;
    var error = config.error;

    var options = getApiOptions('/status');
    return apiRequest(options, success, error);
}

/**
 * Creates a promise to get all seasons.
 */
exports.seasons = function () {

    return new Promise((resolve, reject) => {
        var options = getApiOptions('/shards/pc-eu/seasons');
        return apiRequest(options, resolve, reject);
    }); 
}

/**
 * Creates a promise to get the lifetime stats of a player during the given season.
 * 
 * @param {string} pubgId PUBG API Id of player
 * @param {string} seasonId PUBG API Id of season
 */
exports.playerStats = function (pubgId, seasonId) {

    return new Promise((resolve, reject) => {
        var options = getApiOptions('/shards/pc-eu/players/' + pubgId + '/seasons/' + seasonId);
        apiRequest(options, resolve, reject);
    });
}