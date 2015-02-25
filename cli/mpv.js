var log = require('../lib/log');

var spawn = require('child_process').spawn;

var lib = require('../lib');
var client = lib.client;

exports.description = "Play content from gizmo using mpv";

exports.run = function (args) {

  if (args._[1] === undefined) {
    log.err('please enter <hash>');
    process.exit(1);
  }

  var mpv = spawn('mpv', [
    client.createUrl('/blobs/' + args._[1])
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
