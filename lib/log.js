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

exports.err = function (err) {
  // show that the logged message is an error
  process.stderr.write('Error'.red + ': ');
  // err was passed a string
  if (typeof  err === 'string') {
    process.stderr.write(err);
  // err was passed an error object
  } else if (err.stack !== undefined) {
    process.stderr.write(err.stack);
  }
  process.stderr.write('\n');
};

// print args, super helpful for debugging
bug(args);
