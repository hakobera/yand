var fs = require('fs'),
    util = require('util'),
    libxml = require('libxmlext'),
    cache = require('../lib/cache');

String.prototype.escapeHTML = function () {
  return this.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

util.puts([
"<!DOCTYPE html>",
"<html lang='en'><head><meta http-equiv='content-type' content='text/html; charset=UTF-8' /></head><body>",
"<div id='search'><input type='search' placeholder='Search' autosave='searchdoc' results='10' id='search-field' autocomplete='off' /></div>",
"<ul id='static-list'>"
].join("\n"));

var categories = [];

cache.get('http://nodejs.org/docs/latest/api/index.html', function(err, src) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  var doc = libxml.parseHtmlString(src);

  doc.find("//div[@id='toc']/ul/li/a").forEach(function(a) {
    categories.push(a.text());
  });

  var categoryItems = {};

  categories.forEach(function(category) {
    var ret = [];
    ret.push('<li class="category"><span>' + category + '</span><ul>');
    /*
    categoryItems[category].forEach(function (line) {
      var html = '<li class="sub"><a href="' + line.url + '"><span class="searchable">' + line.title;
      html += '</span></a></li>';
      ret.push(html);
    });
    */
    ret.push('</ul></li>');
    util.puts(ret.join("\n"));
  });

  util.puts([
  "</ul></body></html>",
  ].join("\n"));

  process.exit(0);
});

/*

var categories = [
    'Global Objects',
    'Functions and function scope',
    'Statements',
    'Operators',
    'Misc'
];
var dat = JSON.parse(fs.readFileSync('htdocs/index.json'));
var categoryItems = {};
dat.forEach(function (x) {
    if (!categoryItems[x.category]) {
        categoryItems[x.category] = [];
    }
    categoryItems[x.category].push(x);
});
*/
