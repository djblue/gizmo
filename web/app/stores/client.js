var local = require('./local');
var http = require('./httputil');

var url = require('url');
var auth = require('./auth');

var methods = [
  'get',
  'post',
  'put',
  'delete'
];

exports.createUrl = function (path) {
  return local.get('url') + path + '?auth=' + local.get('token');
};

methods.forEach(function (method) {
  exports[method + 'JSON'] = function () {

    var args = arguments;

    if (local.get('token') === null) {
      // if no token redirect to login page
      window.location.hash = '#/login';
      auth.on('login', function () {
        makeRequest.apply(null, args);
      });
    } else {
      makeRequest.apply(null, args);
    }

    function makeRequest (path, body, done) {

      var options = url.parse(local.get('url'));

      options.path = path;
      options.method = method;
      options.withCredentials = false; // allows cors

      options.headers = {
        'Authorization': 'Bearer ' + local.get('token')
      };

      if (typeof body === 'function') {
        http.request(options, http.bufferBodyJSON(body)).end();
      } else {
        var body = JSON.stringify(body);
        options.headers['Content-Length'] = body.length;
        options.headers['Content-Type'] = 'application/json';
        var req = http.request(options, http.bufferBodyJSON(done));
        req.write(body);
        req.end();
      }
    }

  };
});
