var util = require('util');
var EventEmitter = require('events').EventEmitter;
var local = require('./local');

var url = require('url');

var http = require('./httputil');

var notify = require('./notify');

function AuthStore () {
}

util.inherits(AuthStore, EventEmitter);

AuthStore.prototype.login = function (creds) {
  var options = url.parse(creds.url + '/auth');
  options.withCredentials = false; // this is the important part
  console.log(options);
  options.method = 'POST';
  options.headers = {
    'Content-Type': 'application/json'
  };
  var req = http.request(options, function (res) {
    var body = "";
    res.on('data', function (data) {
      body += data;
    });
    res.on('end', function () {
      try {
        notify.err(body);
        body = JSON.parse(body);
        local.set('token', body.token);
        local.set('url', creds.url);
      } catch (err) {
        notify.err(err)
      }
    });
  });
  var info = {
    name: creds.name,
    pass: creds.pass
  };
  req.write(JSON.stringify(info));
  req.end();
};

module.exports = new AuthStore();
