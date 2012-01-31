function Yand() {
  var self = this;

  self.search = $('#searchField');
  self.indexList = $('#indexList');
  self.results = $('#results');
  self.categories = $('.category', self.indexList);

  self.keys = {
    enter:  13,
    escape: 27,
    up:     38,
    down:   40,
    left: 37,
    right: 39,
    array:  [13, 27, 37, 38, 39, 40]
  };

  self.isMobile = false;
}

Yand.prototype.init = function() {
  var self = this;

  self.initView();
  self.bindEvents();
  self.mobilify();
  self.setupHistory();
  self.loadFirstPage();
};

Yand.prototype.initView = function() {
  var self = this;
  self.categories.each(function() {
    $(this).addClass('close');
  });
};

Yand.prototype.bindEvents = function() {
  var self = this;

  self.search
    .keyup(function(event) {
      if ($.inArray(event.keyCode, self.keys.array) !== -1) {
        self.handleKey(event.keyCode);
      } else {
        self.searchIndex();
      }
    })
    .on('search', function() {
      self.searchIndex();
    })
    .focus();

  $('a', self.indexList).live('click', function(e) {
    e.preventDefault();
    $('li', self.indexList).removeClass('selected');
    $(this).parent().addClass('selected');
    self.linkOpen($(this));
  });

  $('a', self.results).live('click', function(e) {
    e.preventDefault();
    $('li', self.results).removeClass('selected');
    $(this).parent().addClass('selected');
    self.linkOpen($(this));
  });

  $('span:first', self.categories).toggle(function() {
    self.listOpen($(this).closest('.category'));
  }, function() {
    self.listClose($(this).closest('.category'));
  });
};

Yand.prototype.mobilify = function() {
  var self = this;

  var ua = navigator.userAgent;
  if (ua.indexOf('Mobile') !== -1) {
    self.isMobile = true;

    var height = $(parent.window).innerHeight() - 30;
    $('#navigation').css({
      'height': height,
      'overflow-y': 'scroll',
      'overflow-x': 'hidden'
    });

    setTimeout(function() {
      window.parent.scrollTo(0, 1);
    }, 0); // hide address bar
  }
};

Yand.prototype.setupHistory = function() {
  var self = this;
  if (Modernizr.history) {
    window.parent.onpopstate = function(event) {
      var href = event.state;
      if (href) {
        self.linkOpen(href, false);
      }
    };
  }
};

Yand.prototype.loadFirstPage = function() {
  var self = this;

  var loc = window.parent.location,
      query = loc.search,
      hash = loc.hash,
      q = query.match(/\?q=([^&]+)/),
      p = query.match(/\?p=([^&]+)/);

  if (q) {
    q = decodeURIComponent(q[1]).replace(/\+/g, ' ');
    if (q.length > 0) {
      self.search.val(q);
      self.searchIndex();

      var links = $('li > a', self.results);
      if (links.length > 0) {
        self.linkOpen($(links[0]));
      }
    }
  } else if (p && p[1]) {
    self.linkOpen(p[1] + hash);
  } else {
    self.linkOpen('top.html', false);
  }
};

Yand.prototype.handleKey = function(key) {
  var self = this,
      keys = self.keys;

  if (self.results.is(':visible')) {
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
};

Yand.prototype.searchIndex = function() {
  var self = this;

  var query = self.search.val();
  if (query.length) {
    self.results.html('').show();
    self.indexList.hide();

    query = query.toLowerCase();
    $('.searchable', self.indexList).each(function() {
      var el = $(this),
          name = el.text(),
          pos = name.toLowerCase().indexOf(query);

      if (pos != -1 && self.results.text().indexOf(name) === -1) {
        var li = $('<li>');
        li.append(el.parent().parent().find('a:first').clone());
        li.highlight(query);
        self.results.append(li);
      }
    });

    $('.selected', self.indexList).removeClass('selected');
    $('li:first', self.results).addClass('selected');
  } else {
    self.results.hide();
    self.indexList.show();
  }
};

Yand.prototype.listOpen = function(li) {
  li.removeClass('close').children('ul').show();
};

Yand.prototype.listClose = function(li) {
  li.addClass('close').children('ul').hide()
};

Yand.prototype.linkOpen = function(link, saveState) {
  var self = this;

  var href = (typeof link === 'string' ? link : link.attr('href')),
      saveState = (saveState != undefined) ? saveState : true;

  function loadPage() {
    if (parent.docwin && parent.docwin.pageLoad) {
      parent.docwin.pageLoad(href, saveState);
    } else {
      setTimeout(loadPage, 100);
    }
  }
  setTimeout(loadPage, 0);
};

$(function() {
  var navigation_el = $('#navigation').load('navigation.html', function() {
    //load the navigation (not static because it gets generated with the api scraping)
    new Yand().init();
  });
});