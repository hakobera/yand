"use strict";

var libxmlext = require('libxmlext'), 
    fs = require('fs'), 
    util = require('util'), 
    request = require('request'), 
    url = require('url'), 
    async = require('async'),
    cache = require('../lib/cache');

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

    console.log('[url] ' + uri);
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

  //console.log(body);

  self.seen[uri] = true;
  cache.set(uri, body, 10000, function(err) {
    if (err) {
      return callback(err);
    }

    doc.find("//div[@id='toc']//a").forEach(function(a) {
      var href = a.attr('href');
      if (!href) {
        return;
      }
      var nextlink = '' + url.resolve(uri, href.value().replace(/#.*/,  '')).toString();
      if (self.seen[nextlink]) {
        //console.log('[seen2] %s', nextlink);
        return;
      }

      if (nextlink.match(/.*\.html$/) && !pushed[nextlink]) {
        //console.log('[push] %s', nextlink);
        links.push(nextlink);
        pushed[nextlink] = true;
      } else {
        // console.log('[skip] %s', nextlink);
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
  crawler.run('http://nodejs.org/docs/latest/api/index.html', function(err) {
    console.log('done');
    console.timeEnd('elasped');
    process.exit(0);
  });
});