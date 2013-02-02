var http = require('http'),
    st = require('st');

var mount = st({
  path: 'public/',
  url: '/',
  index: 'index.html',
  passthrough: false
});

var server = http.createServer(function (req, res) {
  mount(req, res);
});

var port = process.env.PORT || 3000;
var mode = process.env.NODE_ENV || 'development';
server.listen(port, function () {
  console.log('server is running at port %d in %s mode', port, mode);
});