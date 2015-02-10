var spawn = require('child_process').spawn;
var fs = require('fs');

var http = require('http');

exports.run = function () {

  var options = {
    hostname: 'localhost',
    port: 3000,
    path: '/' + process.argv[2],
    method: 'GEt'
  };

  var req = http.request(options, function(res) {

    var display = spawn('display');

    display.stdout.pipe(process.stdout);
    display.stderr.pipe(process.stderr);

    res.pipe(display.stdin);

    display.on('close', function () {
      process.exit();
    });

  }).end();

};
