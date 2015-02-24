var util = require('util');
var EventEmitter = require('events').EventEmitter;
var local = require('./local');

var url = require('url');

var http = require('./httputil');

var notify = require('./notify');

function AuthStore () {
}

util.inherits(AuthStore, EventEmitter);

AuthStore.prototype.logout = function () {
  local.unset('token');
  local.unset('url');
};

AuthStore.prototype.login = function (creds) {

  var options = url.parse(creds.url + '/auth');

  options.withCredentials = false; // this is the important part
  options.method = 'POST';
  options.headers = {
    'Content-Type': 'application/json'
  };

  var req = http.request(options, http.bufferBodyJSON(function (err, body) {
    if (err) {
      notify.err('login error');
      console.error(err);
    } else {
      local.set('token', body.token);
      local.set('url', creds.url);
      this.emit('login');
    }
  }.bind(this)));

  var info = {
    name: creds.name,
    pass: creds.pass
  };

  req.write(JSON.stringify(info));
  req.end();
};

module.exports = new AuthStore();
