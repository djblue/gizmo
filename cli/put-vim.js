var log = require('../lib/log');

var http = require('http');
var crypto = require('crypto');
var spawn = require('child_process').spawn;
var fs = require('fs');

var hash = crypto.createHash('sha1');

exports.description = "Put vim buffer into gizmod";

exports.run = function () {

  var vim = spawn('vim', ['/tmp/test'], {stdio: 'inherit'});

  vim.on('close', function (err) {

    if (err) throw err;

    var contents = fs.createReadStream('/tmp/test');

    var options = {
      hostname: 'localhost',
      port: 3000,
      path: '/testing',
      method: 'PUT'
    };

    var req = http.request(options, function(res) {

      //console.log('STATUS: ' + res.statusCode);
      //console.log('HEADERS: ' + JSON.stringify(res.headers));

      res.on('data', function (chunk) {
        console.log(JSON.parse(chunk));
        console.log('sha1-' + hash.digest('hex'));
      });

    });

    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });

    contents.on('data', function (data) {
      hash.update(data);
    });

    contents.on('error', function (err) {
      log.err('No content to put');
      process.exit(1);
    });

    contents.on('end', function () {
      fs.unlink('/tmp/test')
    });

    contents.pipe(req);

  });

};
