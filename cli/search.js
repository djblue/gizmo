var lib = require('../lib');
var log = lib.log;
var client = lib.client;

var table = require('text-table');

var util = require('util');
var qs = require('querystring');

var usage = exports.usage = function (bin, cmd) {
  console.log('Usage: ' + bin + ' ' + cmd + ' [OPTIONS] <string>');
};

exports.completion = function (tabtab, data) {
  if (/^--\w?/.test(data.last)) {
    return tabtab.log([
      'size',
      'filename',
      'uploaded',
      'mime',
      '_id'
    ], data, '--');
  }
};

exports.description = "Search content on gizmod";

exports.run = function (args) {

  var parsedArgs = {};

  Object.keys(args).forEach(function (key) {
    if (key !== '_' && key !== 'debug') {
      parsedArgs[key] = args[key];
    }
  });

  var parsedArgs = qs.stringify(parsedArgs);

  log.bug(parsedArgs);

  client.getJSON('/search?' + parsedArgs, function (err, body) {
    if (err) {
      log.err(err);
    } else {
      console.log(util.inspect(body, { showHidden: true, depth: null, colors: true }));
    }
  });

};
