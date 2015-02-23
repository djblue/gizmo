var lib = require('../lib');
var log = lib.log;
var client = lib.client;

var spawn = require('child_process').spawn;
var fs = require('fs');

exports.description = "Edit metadata of certain blob.";

var getMeta = function (hash, done) {

  var p = '/meta/' + hash;

  client.getJSON(p, function (err, meta) {
    if (err) {
      done(err);
    } else {
      done(null, meta);
    }
  });

};

var saveMeta = function (meta, hash, done) {

  var p = '/meta/' + hash;

  client.putJSON(p, meta, function (err, body) {
    if (err) {
      done(err);
    } else {
      done(null, body);
    }
  });

};

exports.run = function (args) {
  
  var blob = args._[1];
  
  if (blob === undefined) {
    log.err('please supply blob');
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
