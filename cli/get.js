var lib = require('../lib');
var log = lib.log;
var client = lib.client;

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
      path: '/blobs/' + args._[1]
    };
    client.get(options, function (res) {
      log.bug(res.statusCode);
      log.bug(res.headers);
      res.pipe(process.stdout);
    }).end();
  }
};
