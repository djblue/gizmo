var util = require('util');

var args = require('minimist')(process.argv.slice(2));

var isDebug = exports.isDebug = function () {
  return args['debug'] || args['d'];
};

var bug = exports.bug = function (msg) {
  if (isDebug()) {
    process.stderr.write('Debug'.green + ': ' +
      util.inspect(msg, {showHidden: true, depth: null}) + '\n');
  }
};

exports.err = function (msg) {
  process.stderr.write('Error'.red + ': ' +
    util.inspect(msg, {showHidden: true, depth: null}) + '\n');
};

// print args, super helpful for debugging
bug(args);
