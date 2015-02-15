var log = require('../lib/log');

var path = require('path');
var bin = path.basename(process.argv[1]);

exports.description = "Print help for specific command";

exports.run = function (args) {

  try {
    var cmd = require('./' + args._[1]);

    if (typeof cmd.usage === 'function') {
      cmd.usage(bin, args._[1]);
    } else {
      log.err('No more usage info: ' + args._[1]);
      process.exit(1);
    }

  } catch (e) {
    log.bug(e);
    log.err('Command not found: ' + args._[1]);
    process.exit(1);
  }

};
