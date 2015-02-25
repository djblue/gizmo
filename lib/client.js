var url = require('url');
var config = require('./config');
var log = require('./log');

// own http module that wraps the builtin with some
// convenience methods
var http = require('./http');

exports.createUrl = function (path) {
  var c = config.get();
  return c.url + path + '?auth=' + c.token;
};

function getDefaultOptions () {
  try {
    var c = config.get();
    var opts = url.parse(c.url);
    if (c.ca !== undefined) {
      opts.ca = c.ca;
    }
    opts.headers = {
      Authorization: 'Bearer ' + c.token
    };
    return opts;
  } catch (err) {
    log.bug(err);
    log.err('please log in');
    process.exit(1);
  }
};

var request = exports.request = function (options, done) {
  var opts = getDefaultOptions();
  // merge options
  for (var key in options) {
    if (key === 'headers') {
      for (var h in options.headers) {
        opts.headers[h] = options.headers[h];
      }
    } else {
      opts[key] = options[key];
    }
  }
  return http.request(opts, done);
};

var methods = [
  'get',
  'post',
  'put',
  'delete'
];

methods.forEach(function (method) {
  exports[method] = function (options, done) {
    log.bug(method.toUpperCase() + ' ' + options.path);
    options.method = method.toUpperCase();
    return request(options, done);
  };
});

methods.forEach(function (method) {
  exports[method + 'JSON'] = function (path, body, done) {
    log.bug(method.toUpperCase() + ' ' + path);
    var opts = {
      path: path,
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (typeof body === 'function') {
      request(opts, http.bufferBodyJSON(body)).end();
    } else {
      var body = JSON.stringify(body);
      opts.headers['Content-Length'] = body.length;
      var req = request(opts, http.bufferBodyJSON(done));
      req.write(body);
      req.end();
    }
  };
});
