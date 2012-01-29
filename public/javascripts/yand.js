var yand = {

  isMobile: false,

  init: function() {
    var self = this;

    var search = $('#searchField'),
        indexList = $('#indexList'),
        results = $('<ul>', { id: 'results' }).insertBefore(indexList),
        categories = $('.category', indexList);

    var keys = {
      enter:  13,
      escape: 27,
      up:     38,
      down:   40,
      left: 37,
      right: 39,
      array:  [13, 27, 37, 38, 39, 40]
    };

    search.keyup(function(event) {
      if ($.inArray(event.keyCode, keys.array) !== -1) {
        self.handleKey(keys, event.keyCode);
      } else {
        self.searchIndex(search, indexList, results);
      }
    })
    .focus();

    $('a', indexList).live('click', function(e) {
      e.preventDefault();
      $('li', indexList).removeClass('selected');
      $(this).parent().addClass('selected');
      self.linkOpen($(this));
    });

    $('a', '#results').live('click', function(e) {
      e.preventDefault();
      $('li', '#results').removeClass('selected');
      $(this).parent().addClass('selected');
      self.linkOpen($(this));
    });

    $('#results').keyup(function(event) {
      event.preventDefault();
      if ($.inArray(event.keyCode, keys.array) !== -1) {
        self.handleKey(keys, event.keyCode);
      }
    });

    categories.each(function() {
      $(this).addClass('close');
    });

    $('span:first', categories).toggle(function() {
      self.listOpen($(this).closest('.category'));
    }, function() {
      self.listClose($(this).closest('.category'));
    });

    var ua = navigator.userAgent;
    if (ua.indexOf('Mobile') !== -1 && ua.indexOf('Safari')) {
      self.isMobile = true;

      var height = $(parent.window).innerHeight() - 30;
      $('#navigation').css({
        'height': height,
        'overflow-y': 'scroll',
        'overflow-x': 'hidden'
      });
    }

    if (Modernizr.history) {
      window.parent.onpopstate = function(event) {
        console.log(event);
        var href = event.state;
        self.linkOpen(href, false);
      };
    }

    var query = window.parent.location.search,
        hash = window.parent.location.hash,
        q = query.match(/\?q=([^&]+)/),
        p = query.match(/\?p=([^&]+)/);

    if (q) {
      q = decodeURIComponent(q[1]).replace(/\+/g, ' ');
      if (q.length > 0) {
        search.val(q);
        self.searchIndex(search, indexList, results);

        var links = $('li > a', results);
        if (links.length > 0) {
          self.linkOpen($(links[0]));
        }
      }
    } else if (p && p[1]) {
      self.linkOpen(p[1] + '#' + hash);
    } else {
      self.linkOpen('top.html', false);
    }
  },

  handleKey: function(keys, key) {
    var self = this;

    var results = $('#results');
    if (results.is(':visible')) {
      var selected = $('.selected:visible');
      if(selected.length) {
        if (key == keys.up && selected.prev().length) {
          selected.removeClass('selected').prev().addClass('selected');
        }
        if (key == keys.down && selected.next().length) {
          selected.removeClass('selected').next().addClass('selected');
        }
        if (key == keys.enter) {
          var href = selected.find('a:first').attr('href');
          self.linkOpen(selected.find('a:first'));
        }

        if (key == keys.right) {
          self.listOpen(selected);
        }

        if (key == keys.left) {
          self.listClose(selected);
        }
      } else {
        if (key == keys.down) {
          selected = $('li:first', results);
          selected.addClass('selected');
        }
      }
    }
  },

  searchIndex: function(search, indexList, results) {
    var query = search.val();

    if (query.length) {
      results.html('').show();
      indexList.hide();

      query = query.toLowerCase();
      $('.searchable', indexList).each(function() {
        var el = $(this);
        var name = el.text();
        var pos = name.toLowerCase().indexOf(query);

        if (pos != -1 && results.text().indexOf(name) === -1) {
          var li = $('<li>');
          li.append(el.parent().parent().find('a:first').clone());
          li.highlight(query);
          results.append(li);
        }
      });

      $('.selected', indexList).removeClass('selected');
      $('li:first', results).addClass('selected');
    } else {
      results.hide();
      indexList.show();
    }
  },

  listOpen: function(li) {
    li.removeClass('close').children('ul').show();
  },

  listClose: function(li) {
    li.addClass('close').children('ul').hide()
  },

  linkOpen: function(link, saveState) {
    var self = this;

    var href = (typeof link === 'string' ? link : link.attr('href')),
        saveState = (saveState != undefined) ? saveState : true,
        docwin = parent.docwin,
        docwinDoc = docwin.document;

    $('#doc', $(docwinDoc)).load(href, function() {
      var _this = $(this);

      if (self.isMobile) {
        var height = $(parent.window).innerHeight();
        _this.css({
          'height': height,
          'overflow-y': 'scroll',
          'overflow-x': 'hidden'
        });
      }

      var i = href.lastIndexOf('#');
      if (i !== -1) {
        var anchor = href.substring(i);

        if (self.isMobile) {
          _this.scrollTop(0);
          var top = _this.find(anchor.replace(/\./g, '\\.')).position().top + 10;
          _this.scrollTop(top);
        } else {
          var top = _this.find(anchor.replace(/\./g, '\\.')).position().top + 10;
          docwin.scrollTo(0, top);
        }

        if (Modernizr.history && saveState) {
          window.parent.history.pushState(href, null, '?p=' + href);
        }
      }
    });
  }
};

$(function() {
  var navigation_el = $('#navigation').load('navigation.html', function() { //load the navigation (not static because it gets generated with the api scraping)
    yand.init();
  });
});