const auth = require('../auth.js');
const https = require('https');
const logger = require('./log').getLogger();
const Cache = require('./cache').Cache;

const PUBG_API_HOST_NAME = "api.playbattlegrounds.com";

const playerByIdCache = new Cache(120);
const playerByNameCache = new Cache(1200);
const statusCache = new Cache(60);
const seasonsCache = new Cache(3600);
const playerStatsCache = new Cache(600);
const matchByIdCache = new Cache(300);

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
            'Authorization': 'Bearer ' + auth.pubgApiKey,
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
    
            // The whole response has been received.
            resp.on('end', () => {
    
                logger.debug('Request finished!');
                
                const apiData  = JSON.parse(data);
    
                if (apiData.errors !== undefined && apiData.errors.length > 0) {
                    
                    const apiError = new ApiError(null, apiData.errors);
                    cache.add(options.path, apiError);

                    reject(apiError);
                    return;
                }

                cache.add(options.path, apiData);
                resolve(apiData);
            });
        }).on("error", (err) => {

            logger.warn("error on making api call", err)
            
            const apiError = new ApiError(err, null);
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

/**
 * Creates a promise to get the current status of the pubg api
 */
exports.status = function () {

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

/**
 * Creates a promise to get infos about match identified by the 
 * given id.
 * 
 * @param {string} matchId the match id
 */
exports.matchById = function (matchId) {

    return new Promise((resolve, reject) => {
        var options = getApiOptions(`/shards/pc-eu/matches/${matchId}`);
        apiRequest(options, resolve, reject, matchByIdCache);
    });
}