var log = require('../lib/log');

var spawn = require('child_process').spawn;
var fs = require('fs');
var http = require('http');

exports.description = "Play content from gizmo using mpv";

exports.run = function (args) {

  var mpv = spawn('mpv', [
    'http://localhost:3000/blobs/' + args._[1]
  ], {
    stdio : 'inherit'
  });

  mpv.on('error', function (err) {
    // mpv isn't installed - let user know
    if (err.errno === 'ENOENT') {
      log.err('Please install mpv: http://mpv.io/installation/');
    } else {
      log.err(err);
    }
  });

  mpv.on('close', function () {
    process.exit();
  });

};

exports.runOld = function () {

  var temp = fs.createWriteStream('temp');

  var options = {
    hostname: 'localhost',
    port: 3000,
    path: '/' + process.argv[2],
    method: 'GET'
  };

  var req = http.request(options, function(res) {

    res.pipe(temp);

    var mpv = spawn('mpv', ['--cache', '999999', 'temp'], {stdio : 'inherit'});

    mpv.on('close', function () {
      process.exit();
    });

  }).end();

};
