var fs = require('fs'),
    url = require('url'),
    util = require('util'),
    libxml = require('libxmlext'),
    cache = require('../lib/cache');

function escapeHTML(s) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderTree(node, level) {
  var hasChild = false;
  if (node[3].length > 0) {
    hasChild = true
  }

  var html = '<li class="' + (hasChild ? 'category' : 'sub') +' level' + level + '"><a href="' + node[2] + node[1] + '"><span class="searchable">' + escapeHTML(node[0]);
  html += '</span></a>';

  if (hasChild) {
    html += '<ul>';
  }
  node[3].forEach(function(child) {
    html += renderTree(child, level + 1);
  });

  if (hasChild) {
    html += '</ul>';
  }

  html += '</li>';

  return html;
}

var categories = [],
    items = require('../tmp/index'),
    uri = 'http://nodejs.org/docs/latest/api/index.html',
    page = [
        "<!DOCTYPE html>",
        "<html lang='en'><head><meta http-equiv='content-type' content='text/html; charset=UTF-8' /></head><body>",
        "<div id='search'><input type='search' placeholder='Search' autosave='searchdoc' results='10' id='search-field' autocomplete='off' /></div>",
        "<ul id='static-list'>"
      ].join("\n");

cache.get(uri, function(err, src) {
  if (err) {
    console.error(err.message);
    console.error(err.stack);
    process.exit(1);
  }

  var doc = libxml.parseHtmlString(src);

  doc.find("//div[@id='toc']/ul/li/a").forEach(function(a) {
    var href = a.attr('href');
    if (!href) {
      return;
    }
    var path = '' + url.resolve(uri, href.value().replace(/#.*/,  '')).toString();

    var category = {
      text: a.text(),
      path: url.parse(path).pathname
    };
    categories.push(category);
  });

  var categoryItems = {};
  items.forEach(function(item) {
    var key = item[2];
    if (!categoryItems[key]) {
      categoryItems[key] = [];
    }
    categoryItems[key].push(item);
  });

  categories.forEach(function(category) {
    var items = categoryItems[category.path];

    page += '<li class="category level1"><span>' + escapeHTML(category.text) + '</span><ul>';

    items.forEach(function(item) {
      page += renderTree(item, 2);
    });

    page += '</ul></li>';
  });

  page += '</ul></body></html>\n';

  fs.writeFileSync('public/navigation.html', page);

  process.exit(0);
});