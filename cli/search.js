var log = require('../lib/log');

var table = require('text-table');

var fs = require('fs');
var http = require('http');
var util = require('util');
var qs = require('querystring');

var usage = exports.usage = function (bin, cmd) {
  console.log('Usage: ' + bin + ' ' + cmd + ' [OPTIONS] <string>');
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

  var options = {
    hostname: 'localhost',
    port: 3000,
    path: '/search?' + parsedArgs,
    method: 'GET'
  };

  log.bug(options);

  var req = http.request(options, function (res) {
    log.bug(res.statusCode);
    var body = "";
    res.on('data', function (data) {
      body += data;
    });
    res.on('end', function () {
      body = JSON.parse(body);
      var out = body.map(function (item) {
        return [
          
        ];
      });
      console.log(util.inspect(body, { showHidden: true, depth: null, colors: true }));
    });
  });

  req.on('error', function (err) {
    log.err(err);
  });

  req.end();

};
