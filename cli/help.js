var log = require('../lib/log');

var fs = require('fs');
var path = require('path');
var bin = path.basename(process.argv[1]);

exports.description = "Print help for specific command";

exports.usage = function () {
};

exports.completion = function (tabtab, data) {
  if (data.words < 3) {
    var cmds = fs.readdirSync(__dirname)
      .filter(function (file) {
        // only include js files and not this index file
        return file.match(/\.js$/)
           && !file.match('index')
           && !file.match('help');
      })
      .map(function (file) {
        // remove file extensions
        return file.replace('.js', '');
      });
    return tabtab.log(cmds, data);
  }
};

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
