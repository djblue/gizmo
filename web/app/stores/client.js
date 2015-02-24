var local = require('./local');
var util = require('./httputil');

var token = local.get('token');
var url = require('url');

var http = require('./httputil');

var methods = [
  'get',
  'post',
  'put',
  'delete'
];

exports.createUrl = function (path) {
  return local.get('url') + path + '?auth=' + token;
};

methods.forEach(function (method) {
  exports[method + 'JSON'] = function (path, body, done) {

    var options = url.parse(local.get('url') || window.location.origin);

    options.path = path;
    options.method = method;
    options.withCredentials = false; // allows cors

    if (token !== null) {
      options.headers = {
        authorization: 'Bearer ' + token
      };
    }

    if (typeof body === 'function') {
      util.request(options, http.bufferBodyJSON(body)).end();
    } else {
      var body = JSON.stringify(body);
      opts.headers['Content-Length'] = body.length;
      var req = util.request(options, util.bufferBodyJSON(done));
      req.write(body);
      req.end();
    }

  };
});
