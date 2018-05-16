const logger = require('./log').getLogger();
const moment = require('moment');
const _ = require('lodash')

/**
 * Class for caching objects based on a key for a given amount of "cache time".
 */
class Cache {

    /**
     * Constructor for the Cache-class.
     * 
     * @param {Number} cacheTime Time an item remains in cache (in s)
     */
    constructor(cacheTime = 300) {
        this.items = {};
        this.cacheTime = cacheTime;
    }

    /**
     * Adds an object to the cache.
     * 
     * Throws an error, if there already is an object under the given key.
     * 
     * @param {String} key Key to store the item under
     * @param {Object} value The object to store
     */
    add(key, value) {

        if (key === null) {
            throw new Error("Can't add object under key 'null'")
        } else if (key === undefined) {
            throw new Error("Can't add object under key 'undefined'")
        }

        if (value === null) {
            throw new Error("Can't add 'null' to cache")
        } else if (value === undefined) {
            throw new Error("Can't add 'undefined' to cache")
        }

        if (this.items[key] !== undefined && this.items[key] !== null) {

            // if the item in cache exceeded the cache item, it is invalid and can be replaced
            if (this._isItemInvalid(this.items[key])) {
                // add item to cache
                this.items[key] = new CacheItem(value);
            } else {
                throw new Error(`There already is an object stored under the key '${key}'`);
            }
        } else {
            this.items[key] = new CacheItem(value);
        }
    }

    /**
     * Retrieves an object from the cache and returns it. If no object is found
     * for the given key, null is returned instead.
     * 
     * @param {String} key Key of object to retrieve.
     */
    retrieve(key) {
        if (this.items[key] !== null) {
            if (this._isItemInvalid(this.items[key])) {
                return null;
            } else {
                return this.items[key].value;
            }
        }
        return null;
    }

    /**
     * Removes all objects that exceeded their cache time from the cache.
     */
    tidy() {
        _.forOwn(this.items, (value, key) => {
            if (this._isItemInvalid(value)) {
                delete this.items[key]; // remove item from cache
            }
        })
    }

    count() {
        return Object.keys(this.items).length;
    }

    /**
     * Returns true if item is still valid (meaning the duration between the
     * creation of the object and now is smaller than the cache time).
     * 
     * @param {CacheItem} item 
     */
    _isItemInvalid(item) {

        if (item === null) {
            throw new Error("Invalid parameter 'null'")
        } else if (item === undefined) {
            throw new Error("Invalid parameter 'undefined'")
        }

        let duration = moment.duration(moment().diff(item.createdAt));
        return duration.asSeconds() > this.cacheTime;
    }
}

class CacheItem {

    constructor(value) {
        this.value = value;
        this.createdAt = moment();
    }
}

exports.Cache = Cache;
exports.CacheItem = CacheItem;