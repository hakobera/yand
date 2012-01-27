"use strict";
/**
 * Convert cache to index.json.
 **/

var fs = require('fs'),
    util = require('util'),
    path = require('path'),
    libxml = require('libxmlext'),
    cache = require('../lib/cache'),
    url = require('url'),
    mkdirp = require('mkdirp'),
    crypto = require('crypto'),
    async = require('async');

function makeTree(uri, parent, li) {
  var node = [];

  li.find('a').forEach(function(a) {
    node[0] = a.text()? a.text() : '';
    node[1] = a.attr('href') ? a.attr('href').value() : '';
  });
  node[2] = uri;
  node[3] = [];
  parent.push(node);

  var children = li.find('ul/li');
  if (children.length > 0) {
    children.forEach(function(child) {
      makeTree(uri, node[3], child);
    });
  }
}

console.time('processTime');
cache.keys('http://nodejs.org/docs/latest/api/*', function(err, keys) {
  var uri = keys[0],
      root = [];

  async.forEach(keys, function(uri, next) {
    if (uri.indexOf('index.html') !== -1) {
      return next();
    }

    cache.get(uri, function(err, src) {
      if (err) {
        return next(err);
      }

      var doc = libxml.parseHtmlString(src);

      var path = url.parse(uri).pathname;
      doc.find("//div[@id='toc']/ul/li").forEach(function(li) {
        makeTree(path, root, li);
      });

      next();
    });
  }, function(err) {
    console.log(util.inspect(root, false, 4));
    console.timeEnd('processTime');

    if (err) {
      console.log(err.message);
      process.exit(1);
    } else {
      console.log('done');
      process.exit(0);
    }
  });
});
