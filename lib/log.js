var args = require('minimist')(process.argv.slice(2));

var isDebug = exports.isDebug = function () {
  return args['debug'] || args['d'];
};

var bug = exports.bug = function (msg) {
  if (isDebug()) {
    process.stderr.write('Debug'.green + ': ' + JSON.stringify(msg) + '\n');
  }
};

exports.err = function (msg) {
  process.stderr.write('Error'.red + ': ' + JSON.stringify(msg) + '\n');
};

// print args, super helpful for debugging
bug(args);
