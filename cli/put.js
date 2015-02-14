var log = require('../lib/log');

var http = require('http');
var crypto = require('crypto');

var hash = crypto.createHash('sha1');

exports.description = "Put stream into gizmod";

exports.run = function () {

  process.stdin.resume();

  var options = {
    hostname: 'localhost',
    port: 3000,
    path: '/testing',
    method: 'PUT'
  };

  var req = http.request(options, function(res) {

    log.bug(res.statusCode);
    log.bug(res.headers);

    res.on('data', function (chunk) {
      log.bug(chunk);
      console.log('sha1-' + hash.digest('hex'));
    });

  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  process.stdin.on('data', function (data) {
    hash.update(data);
  });

  process.stdin.pipe(req);

};
