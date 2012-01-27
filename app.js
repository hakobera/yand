var connect = require('connect');

var server = connect(
  connect.static(__dirname + '/public')
);

var port = process.env.PORT || 3000;
server.listen(port);
console.log('server is running at port %d', port);