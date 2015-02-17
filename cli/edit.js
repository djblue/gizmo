var log = require('../lib/log');

var http = require('http');
var spawn = require('child_process').spawn;
var fs = require('fs');


exports.description = "Edit metadata of certain blob.";

var getMeta = function (hash, done) {

  var options = {
    hostname: 'localhost',
    port: 3000,
    path: '/meta/' + hash,
    method: 'GET'
  };

  var req = http.request(options, function(res) {

    log.bug(res.statusCode);
    log.bug(res.headers);

    var meta = "";

    res.on('data', function (data) {
      meta += data;
    });

    res.on('end', function () {
      try {
        done(null, JSON.parse(meta));
      } catch (err) {
        done(err);
      }
    });

  });

  req.on('error', function(err) {
    done(err);
  });

  req.end();

};

var saveMeta = function (contents, hash, done) {

  var body = JSON.stringify(contents);

  var options = {
    hostname: 'localhost',
    port: 3000,
    path: '/meta/' + hash,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': body.length
    }
  };

  var req = http.request(options, function(res) {

    var body = "";

    res.on('data', function (data) {
      body += data;
    });

    res.on('end', function () {
      try {
        done(null, JSON.parse(body));
      } catch (err) {
        done(err);
      }
    });

  });

  req.on('error', done);

  req.write(body);
  req.end();

};

exports.run = function (args) {
  
  var blob = args._[1];
  
  if (blob === undefined) {
    log.err('Please supply blob');
  } else {
    getMeta(args._[1], function (err, meta) {
      if (err) {
        log.err(err);
      } else {
        fs.writeFileSync('/tmp/test.json', JSON.stringify(meta, null, 2));

        var vim = spawn('vim', ['/tmp/test.json'], {stdio: 'inherit'});

        vim.on('close', function (err) {

          if (err) throw err;

          var contents = fs.readFileSync('/tmp/test.json');

          try {
            var meta = JSON.parse(contents);
            saveMeta(meta, blob, function (err, body) {
              if (err) {
                log.err(err);
              } else {
                log.bug(body);
              }
            });
          } catch (err) {
            log.err(err);
          }

          fs.unlink('/tmp/test.json');

        });

      }
    });
  }

};
