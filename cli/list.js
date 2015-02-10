var log = require('../lib/log');

var http = require('http');

exports.description = "List all blobs from gizmod";

exports.run = function () {

  var options = {
    hostname: 'localhost',
    port: 3000,
    path: '/blobs',
    method: 'GET'
  };

  var req = http.request(options, function(res) {

    log.bug(res.statusCode);
    log.bug(res.headers);


    var body = "";
    
    res.on('data', function (chunk) {
      body += chunk;
    });

    res.on('end', function () {
      body = JSON.parse(body);
      process.stdout.write(body.join('\n') + '\n');
    });

  }).end();

};
