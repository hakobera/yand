$(function() {
  var ua = navigator.userAgent,
      isMobile = (ua.indexOf('Mobile') !== -1);

  window.pageLoad = function(href, saveState) {
    $('#doc', $(document)).load(href, function() {
      var _this = $(this);

      if (isMobile) {
        var height = $(parent.window).innerHeight();
        _this.css({
          'height': height,
          'overflow-y': 'scroll',
          'overflow-x': 'hidden'
        });
      }

      var i = href.lastIndexOf('#');
      if (i !== -1) {
        var anchor = href.substring(i),
            selector = anchor.replace(/\./g, '\\.'), // anchor may include dot
            target;

        if (isMobile) {
          _this.scrollTop(0);
          target = _this.find(selector);
          _this.scrollTop(target.position().top + 20);
        } else {
          target = _this.find(selector);
          window.scrollTo(0, target.position().top + 15);
        }

        target.addClass('highlight');
      }

      if (Modernizr.history && saveState) {
        window.parent.history.pushState(href, null, '?p=' + href);
      }

      highlight(undefined, undefined, 'pre');
    });
  }
});