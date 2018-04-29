var auth = require('./auth.json');
var https = require('https');

const PUBG_API_HOST_NAME = "api.playbattlegrounds.com";
const PUBG_API_KEY = auth.pubgApiKey;

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

function apiRequest(options, onFinished, onError) {

    https.get(options, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            onFinished(JSON.parse(data));
        });

    }).on("error", (err) => {
        // console.log("Error: " + err.message);
        logger.warn("Error: " + err.message);
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

    var options = getOptions('/shards/pc-eu/players/' + id);
    return apiRequest(options, success, error);
};