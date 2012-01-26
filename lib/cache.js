var redis = require("redis"),
    url = require('url');

/**
 * Initialize Cache with the given 'options'.
 * Return the cache using Redis.
 *
 * @param {Object} options.
 * @return {Cache}
 * @public
 */
var Cache = function(options) {
  options = options || {};
  console.log('Cache servier is %s', options.host);
  console.dir(options);
  this.client = new redis.createClient(options.port, options.host, options);
  this.client.on("error", function (err) {
    console.error(err);
  });

  if (options.pass) {
    this.client.auth(options.pass, function(err) {
      if (err) {
        console.error(err);
        throw err;
      }
    });
  }

  if (options.db) {
    var self = this;
    self.client.select(options.db);
    self.client.on('connect', function() {
      self.client.send_anyway = true;
      self.client.select(options.db);
      self.client.send_anyway = false;
    });
  }
};

/**
 * Get object from cache the by given 'key'.
 *
 * @param {String} key key of object
 * @param {Function} callback callback function
 */
Cache.prototype.get = function(key, callback) {
  this.client.get(key, function(err, data) {
    try {
      if (!data) {
        return callback();
      }
      callback(null, JSON.parse(data.toString()));
    } catch(err) {
      callback(err);
    }
  });
};

/**
 * Set object to cache associated with the given 'key'.
 *
 * @param {String} key
 * @param {Object} value
 * @param {Number} ttl
 * @param {Function} callback
 */
Cache.prototype.set = function(key, value, ttl, callback) {
  try {
    var t = isNaN(ttl)? parseInt(ttl, 10) : ttl;
    if (isNaN(t) || t <= 0) {
      this.client.set(key, JSON.stringify(value), function() {
        callback && callback.apply(this, arguments);
      });
    } else {
      this.client.setex(key, ttl, JSON.stringify(value), function() {
        callback && callback.apply(this, arguments);
      });
    }
  } catch(err) {
    callback && callback(err);
  }
};

/**
 * Remove object from cache by the given 'key'.
 *
 * @param {String} key
 * @param {Function} callback
 */
Cache.prototype.remove = function(key, callback) {
  this.client.del(key, callback);
};

/**
 * Clear all cached objects.
 *
 * @param {Function} callback
 */
Cache.prototype.clear = function(callback) {
  this.client.flushdb(callback);
};

/**
 * Find all keys matching the given pattern
 *
 * @param {String} pattern
 * @param {Function} callback
 */
Cache.prototype.keys = function(pattern, callback) {
  this.client.keys(pattern, callback);
};

var cache = null;
if (process.env.REDISTOGO_URL) {
  var redisUri = url.parse(process.env.REDISTOGO_URL);
  cache = new Cache({
    host: redisUri.hostname,
    port: redisUri.port,
    pass: redisUri.auth.split(':')[1]
  });
} else {
  cache = new Cache({
    host: 'localhost'
  });
}

module.exports = cache;
