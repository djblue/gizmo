var lib = require('../lib');
var log = lib.log;
var client = lib.client;
var http = lib.http;

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

      meta.size = stat.size;
      meta.filename = path.basename(fname);
      meta.uploaded = (new Date()).toISOString();
      meta.mime = mime.lookup(meta.filename);

      var p = '/meta/sha1-' + hash;

      client.putJSON(p, meta, function (err, body) {
        if (err) {
          log.err(err);
        } else {
          log.bug(body);
        }
      });
    }

    var bar = new ProgressBar('uploading [:bar] :percent :etas', {
      complete: '#'.red,
      incomplete: '-',
      width: 20,
      total: stat.size
    });

    var file = fs.createReadStream(fname);
    var hash = crypto.createHash('sha1');

    var options = {
      path: '/blobs',
      headers: {
        'Transfer-Encoding': 'chunked'
      }
    };

    var req = client.put(options, http.bufferBodyJSON(function (err, body) {
      if (err) {
        log.err(err);
      } else {
        hash = hash.digest('hex');
        console.log(body);
        console.log('sha1-' + hash);
        updateMeta();
      }
    }));

    req.on('error', function(e) {
      log.err(e.message);
    });

    file.on('data', function (data) {
      hash.update(data);
      bar.tick(data.length);
    });

    file.pipe(req);

  });
};
