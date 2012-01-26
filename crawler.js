"use strict";

var libxmlext = require('libxmlext'), 
    fs = require('fs'), 
    util = require('util'), 
    request = require('request'), 
    url = require('url'), 
    async = require('async');



function Crawler() {
  this.seen = {};
}

Crawler.prototype.run = function(uri, callback) {
  var self = this;
  callback = callback || function() {};

  if (self.seen[uri]) {
    return callback('[seen] ' + uri);
  }

  console.log('[url] ' + uri);

  request.get(uri, function(err, res, body) {
    if (err) {
      return callback(util.format('%s : %s', uri, err));
    }

    if (res.statusCode !== 200) {
      return callback(util.format('%s : %d : %s', url,  res.statusCode, err));
    }

    self.processBody(uri, body, function(err, uris) {
      if (err) {
        return callback(err);
      }
      async.forEach(uris,
        function(item, next) {
          //console.log(item);
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
      console.log('[push] %s', nextlink);
      links.push(nextlink);
      pushed[nextlink] = true;
    } else {
      // console.log('[skip] %s', nextlink);
    }
  });

  callback(null, links);
};

console.time('elasped');

var crawler = new Crawler();
crawler.run('http://nodejs.org/docs/latest/api/index.html');

process.on('exit', function() {
  console.timeEnd('elasped');
});
