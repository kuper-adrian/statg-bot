/**
 * @module PubgApi
 */

let auth = require('../auth.json');
let https = require('https');
let logger = require('./log').getLogger();
let Cache = require('./cache').Cache;

const PUBG_API_HOST_NAME = "api.playbattlegrounds.com";
const PUBG_API_KEY = auth.pubgApiKey;

let playerByIdCache = new Cache(120);
let playerByNameCache = new Cache(1200);
let statusCache = new Cache(60);
let seasonsCache = new Cache(3600);
let playerStatsCache = new Cache(600);
let matchByIdCache = new Cache(300);

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
 * @param {Cache} cache Cache to store results in.
 */
function apiRequest(options, resolve, reject, cache) {

    logger.debug(`starting api request for path "${options.path}"...`)

    let cachedObject = cache.retrieve(options.path);
    if (cachedObject !== null) {

        logger.debug("retrieved pubg api data from cache");

        if (cachedObject === typeof(new ApiError)) {
            reject(cachedObject);
        } else {
            resolve(cachedObject);
        }
    } else {

        https.get(options, (resp) => {
            let data = '';
    
            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });
    
            // The whole response has been received. Print out the result.
            resp.on('end', () => {
    
                logger.debug('Request finished!');
                
                var apiData  = JSON.parse(data);
    
                if (apiData.errors !== undefined && apiData.errors.length > 0) {
                    
                    let apiError = new ApiError(null, apiData.errors);
                    cache.add(options.path, apiError);

                    reject(apiError);
                }

                cache.add(options.path, apiData);
                resolve(apiData);
            });
        }).on("error", (err) => {
            
            let apiError = new ApiError(err, null);
            cache.add(options.path, apiError);

            reject(apiError);
        });
    }
}

/**
 * Creates a promise to get PUBG API info about player
 * 
 * @param {string} name pubg player name
 */
exports.playerByName = function (name) {

    return new Promise((resolve, reject) => {
        var options = getApiOptions(`/shards/pc-eu/players?filter[playerNames]=${name}`);
        return apiRequest(options, resolve, reject, playerByNameCache);
    })
};

/**
 * Creates a promise to get PUBG api info about player
 * 
 * @param {string} id pubg id of player 
 */
exports.playerById = function (id) {
 
    return new Promise((resolve, reject) => {
        var options = getApiOptions(`/shards/pc-eu/players/${id}`);
        return apiRequest(options, resolve, reject, playerByIdCache);
    });
};

exports.status = function (config) {

    return new Promise((resolve, reject) => {
        var options = getApiOptions('/status');
        return apiRequest(options, resolve, reject, statusCache);
    });
}

/**
 * Creates a promise to get all seasons.
 */
exports.seasons = function () {

    return new Promise((resolve, reject) => {
        var options = getApiOptions('/shards/pc-eu/seasons');
        return apiRequest(options, resolve, reject, seasonsCache);
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
        var options = getApiOptions(`/shards/pc-eu/players/${pubgId}/seasons/${seasonId}`);
        apiRequest(options, resolve, reject, playerStatsCache);
    });
}

exports.matchById = function (matchId) {

    return new Promise((resolve, reject) => {
        var options = getApiOptions(`/shards/pc-eu/matches/${matchId}`);
        apiRequest(options, resolve, reject, matchByIdCache);
    });
}