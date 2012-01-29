"use strict";
/**
 * Convert cache to converted/ data.
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

libxml.Element.prototype.addClass = function(klass) {
  var origAttr = this.attr('class')
  if (origAttr) {
    origAttr.value(origAttr.value() + " " + klass);
  } else {
    this.attr({'class': klass});
  }
};

mkdirp.sync('public/docs', parseInt('744', 8));

console.time('processTime');

cache.keys('http://nodejs.org/docs/latest/api/*', function(err, keys) {
  async.forEach(keys, function(uri, next) {
    cache.get(uri, function(err, src) {
      if (err) {
        return next(err);
      }

      var path = url.parse(uri).pathname,
          rootPath = 'public',
          relativePath = '/docs' + path.substr(path.lastIndexOf('/')),
          filePath = rootPath + relativePath,
          doc = libxml.parseHtmlString(src);

      doc.search('head, script, header, #intro, #column2, #toc, .top, .mark, #footer, footer, noscript').forEach(function (e) {
        e.remove();
      });

      doc.search('#column1 a').forEach(function (a) {
        var href = a.attr('href').value();

        if (href.substr(0, 5) === 'http:' || href.substr(0, 6) === 'https:') {
          // external site
          a.attr('target', '_blank');
        } else if (href.substr(0, 1) === '#') {
          // internal anchor link
          a.attr('href', 'javascript:void(0);');
          a.attr('onclick', "javascript:pageLoad('" + relativePath + href + "', true)");
        } else {
          // site internal link
          console.log(href);
          a.attr('href', 'javascript:void(0);');
          a.attr('onclick', "javascript:pageLoad('/docs/" + href + "', true)");
        }
      });

      console.log('writing ' + filePath);
      fs.writeFileSync(filePath, doc.toString());

      next();
    });
  }, function(err) {
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
