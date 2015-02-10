var log = require('../lib/log');

var http = require('http');
var crypto = require('crypto');
var colors = require('colors');
var mime = require('mime-types');

var fs = require('fs');
var path = require('path');

var ProgressBar = require('progress');


exports.usage = function (bin, cmd) {
  console.log('Usage: ' + bin + ' ' + cmd+ ' [OPTIONS] <file>\n');
  console.log(desc);
};

var desc = exports.description = "Put file into gizmod";

exports.run = function (args) {

  var fname = args._[1];

  fs.stat(fname, function (err, stat) {

    function updateMeta () {

      var meta = {};

      var options = {
        hostname: 'localhost',
        port: 3000,
        path: '/meta/sha1-' + hash,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      var body = "";

      log.bug(options.method + ' ' + options.path);
      var req = http.request(options, function (res) {
        res.on('data', function (chunk) {
          body += chunk;
        });
        res.on('end', function () {
          log.bug(res.statusCode);
          log.bug(JSON.parse(body));
        });
      });

      meta.size = stat.size;
      meta.filename = path.basename(fname);
      meta.uploaded = (new Date()).toISOString();
      meta.mime = mime.lookup(meta.filename);

      req.write(JSON.stringify(meta));
      req.end();

      console.log(JSON.stringify(meta))

    }

    var bar = new ProgressBar('uploading [:bar] :percent :etas', {
      complete: '#'.blue,
      incomplete: '-',
      width: 20,
      total: stat.size
    });

    var file = fs.createReadStream(fname);
    var hash = crypto.createHash('sha1');

    var options = {
      hostname: 'localhost',
      port: 3000,
      path: '/blobs',
      method: 'PUT',
      headers: {
        'Transfer-Encoding': 'chunked'
      }
    };

    log.bug(options.method + ' ' + options.path);
    var req = http.request(options, function(res) {

      log.bug(res.statusCode);
      log.bug(res.headers);

      res.on('data', function (chunk) {
        console.log(JSON.parse(chunk));
        hash = hash.digest('hex')
        console.log('sha1-' + hash);
      });

      res.on('end', updateMeta);

    });

    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });

    file.on('data', function (data) {
      hash.update(data);
      bar.tick(data.length);
    });

    file.pipe(req);

  });
};
