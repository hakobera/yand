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

mkdirp.sync('htdocs/converted', parseInt('744', 8));

console.time('processTime');

cache.keys('http://nodejs.org/docs/latest/api/*', function(err, keys) {
  async.forEach(keys, function(key, next) {
    cache.get(key, function(err, src) {
      if (err) {
        return next(err);
      }

      var doc = libxml.parseHtmlString(src);
      doc.search('script, header, #intro, #column2, footer, head, noscript').forEach(function (e) {
        e.remove();
      });

      doc.find("//div[@id='footer']/ul").forEach(function(e) {
        e.remove();
      });

      var path = url.parse(key).pathname;

      var title = path.replace(/^\/en\/JavaScript\/Reference\//, '').replace(/^[^/]+\//, '').replace(/\//g, '.').replace(/_/g, ' ');
      if (path == '/docs/latest/api/index.html') {
          title = 'Top page';
      }
      doc.search('#title').forEach(function (e) {
        e.text(title)
        e.addClass('entry-title roundTop');
      });
      doc.search('#content').forEach(function (e) {
        e.attr('id').remove(); // dup with system id
        e.addClass('entry-content');
      });

      var md5 = crypto.createHash('md5');
      md5.update(path);
      var ofname = 'htdocs/converted/' + md5.digest('hex');

      console.log('writing ' + ofname);
      fs.writeFileSync(ofname, doc.toString());

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
