var log = require('../lib/log');

var http = require('http');

var usage = exports.usage = function (bin, cmd) {
  console.log('Usage: ' + bin + ' ' + cmd + ' [OPTIONS] <sha1>\n');
  console.log(desc);
};

var desc = exports.description = "Get content from gizmod";

exports.run = function (args) {

  if (args._[1] === undefined) {
    log.err('please include <sha1>');
    usage();
  } else {
    var options = {
      hostname: 'localhost',
      port: 3000,
      path: '/blobs/' + args._[1],
      method: 'GEt'
    };

    var req = http.request(options, function(res) {

      log.bug(res.statusCode);
      log.bug(res.headers);

      res.pipe(process.stdout);

    }).end();
  }

};
