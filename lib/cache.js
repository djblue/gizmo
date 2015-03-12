var config = require('./config');
var pth = require('path');
var log = require('./log');

var level = require('level');

module.exports = function (path) {

  log.bug('cache path = ' + path);

  var db = level(path, {
    keyEncoding: 'utf8',
    valueEncoding: 'binary'
  });

  return {
    async: function (key, fn, done) {
      log.bug('cache lookup key = ' + key);
      db.get(key, function (err, data) {
        if (err) {
          log.bug('cache miss key = ' + key);
          fn(function (err, result) {
            if (err) {
              done(err);
            } else {
              db.put(key, result);
              done(null, result);
            }
          });
        } else {
          log.bug('cache hit key = ' + key);
          // use cached version
          done(null, data);
        }
      });
    }
  };
}
