"use strict";

var libxmlext = require('libxmlext'), 
    fs = require('fs'), 
    util = require('util'), 
    request = require('request'), 
    url = require('url'), 
    async = require('async'),
    cache = require('../lib/cache');

function debug(obj) {
  if (process.env.NODE_DEBUG) {
    console.log(obj);
  }
}

function Crawler() {
  this.seen = {};
}

Crawler.prototype.run = function(uri, callback) {
  var self = this;
  callback = callback || function() {};

  if (self.seen[uri]) {
    return callback('[seen] ' + uri);
  }

  request.get(uri, function(err, res, body) {
    if (err) {
      return callback(util.format('%s : %s', uri, err));
    }

    if (res.statusCode !== 200) {
      return callback(util.format('%s : %d : %s', url,  res.statusCode, err));
    }

    console.log('[content] %s', uri);
    self.processBody(uri, body, function(err, uris) {
      if (err) {
        return callback(err);
      }
      async.forEach(uris,
        function(item, next) {
          self.run(item, next);
        },
        function(err) {
          callback(err);
        }
      );
    });
  });
};

Crawler.prototype.processBody = function(uri, body, callback) {
  var self = this,
      doc = libxmlext.parseHtmlString(body),
      pushed = {},
      links = [];

  self.seen[uri] = true;
  console.log(uri);
  cache.set(uri, body, 10000, function(err) {
    if (err) {
      return callback(err);
    }

    doc.find("//div[@id='apicontent']//a").forEach(function(a) {
      var href = a.attr('href');
      if (!href) {
        return;
      }
      var nextlink = '' + url.resolve(uri, href.value().replace(/#.*/,  '')).toString();
      if (self.seen[nextlink]) {
        debug('[seen2] ' + nextlink);
        return;
      }

      if (nextlink.match(/.*\.html$/) && !pushed[nextlink]) {
        debug('[push] ' + nextlink);
        links.push(nextlink);
        pushed[nextlink] = true;
      } else {
        debug('[skip] ' + nextlink);
      }
    });

    callback(null, links);
  });
};

console.time('elasped');

cache.clear(function(err) {
  if (err) {
    throw new Error(err.message);
  }

  var crawler = new Crawler();
  var version = process.env.NODE_VERSION || 'latest';
  var srcUrl = 'http://nodejs.org/docs/' + version + '/api/index.html' 
  console.log('Get Document from %s', srcUrl);
  crawler.run(srcUrl, function(err) {
    console.timeEnd('elasped');
    process.exit(0);
  });
});