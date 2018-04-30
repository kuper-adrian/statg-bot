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

function apiRequest(options, success, error) {

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
                            
                error(new ApiError(null, apiData.errors));
                return;
            }
            success(apiData);
            return;
        });
    }).on("error", (err) => {
        
        error(err, null);
        return;
    });
}

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

exports.match