var util = require('util');
var path = require('path');
var colors = require('colors');

var args = require('minimist')(process.argv.slice(2));

var isDebug = exports.isDebug = function () {
  return args['debug'] || args['d'];
};

function printObj (prefix, obj, indent) {
  process.stderr.write(prefix + ': ');
  if (typeof  obj === 'string') {
    process.stderr.write(obj);
  // err was passed an error object
  } else if (obj.stack !== undefined) {
    process.stderr.write('STACK TRACE\n'.red + indent(obj.stack));
  } else {
    process.stderr.write(JSON.stringify(obj));
  }
  process.stderr.write('\n');
};

var indent = function (color) {
  return function (text) {
    return text.split('\n').map(function (line) {
      return color('==>    ') + line;
    }).join('\n');
  }
};

// I need to get the line and filename of the calling
// function for my logging functions. I found this on 
// stack overflow and modified it a little to print the
// info from the previous stack frame, not the current
// stack frame.
// link: http://stackoverflow.com/questions/14172455/get-name-and-line-of-calling-function-in-node-js
// starts here ----------------------------------------
Object.defineProperty(global, '__stack', {
  get: function () {
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function (_, stack) {
      return stack;
    };
    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  }
});
Object.defineProperty(global, '__line', {
  get: function () {
    return __stack[2].getLineNumber();
  }
});
Object.defineProperty(global, '__function', {
  get: function () {
    return __stack[2].getFunctionName();
  }
});
Object.defineProperty(global, '__file', {
  get: function () {
    return __stack[2].getFileName();
  }
});
// end here -------------------------------------------

var bug = exports.bug = function (obj) {
  if (isDebug()) {
    var line = __line;
    var file = path.relative(process.cwd(), __file);
    var id = file + ':' + line;
    printObj('Debug('.green + id + ')'.green, obj, indent(colors.green));
  }
};

exports.err = function (obj) {
  if (isDebug()) {
    var line = __line;
    var file = path.relative(process.cwd(), __file);
    var id = file + ':' + line;
    printObj('Error('.red + id + ')'.red, obj, indent(colors.red));
  } else {
    printObj('Error'.red, obj, indent(colors.red));
  }
};

// print args, super helpful for debugging
bug(args);
