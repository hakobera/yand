var connect = require('connect'),
    stylus = require('stylus');

function compile(str, path) {
  return stylus(str)
    .import(__dirname + '/css/mixins/blueprint')
    .import(__dirname + '/css/mixins/css3')
    .set('filename', path)
    .set('warn', true)
    .set('compress', true);
}

var server = connect(
  stylus.middleware({
    src: __dirname + '/public',
    force: true
  }),
  connect.static(__dirname + '/public')
);

var port = process.env.PORT || 3000;
server.listen(port);
console.log('server is running at port %d', port);