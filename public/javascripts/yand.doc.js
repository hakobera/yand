$(function() {
  var ua = navigator.userAgent,
      isMobile = (ua.indexOf('Mobile') !== -1 && ua.indexOf('Safari') !== -1);

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
            top = 0;

        if (isMobile) {
          _this.scrollTop(0);
          top = _this.find(selector).position().top;
          _this.scrollTop(top);
        } else {
          top = _this.find(selector).position().top;
          window.scrollTo(0, top);
        }
      }

      if (Modernizr.history && saveState) {
        window.parent.history.pushState(href, null, '?p=' + href);
      }
    });
  }
});