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
    async = require('async');

function makeTree(path, parent, li) {
  var node = [];

  li.find('a').forEach(function(a) {
    node[0] = a.text()? a.text() : '';
    node[1] = a.attr('href') ? a.attr('href').value() : '';
  });
  node[2] = path;
  node[3] = [];
  parent.push(node);

  var children = li.find('ul/li');
  if (children.length > 0) {
    children.forEach(function(child) {
      makeTree(path, node[3], child);
    });
  }
}

mkdirp.sync('tmp', parseInt('744', 8));

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

      var doc = libxml.parseHtmlString(src),
          fullPath = url.parse(uri).pathname,
          path = fullPath.substr(fullPath.lastIndexOf('/')),
          lists = doc.find("//div[@id='toc']/ul/li");

      if (lists.length > 0) {
        lists.forEach(function(li) {
          makeTree(path, root, li);
        });
      } else {
        root.push(['', '', path, []]);
      }

      next();
    });
  }, function(err) {
    console.timeEnd('processTime');

    if (err) {
      console.log(err.message);
      process.exit(1);
    } else {
      console.log(util.inspect(root, false, 4));
      fs.writeFileSync('tmp/index.json', JSON.stringify(root, true));
      console.log('done');
      process.exit(0);
    }
  });
});
