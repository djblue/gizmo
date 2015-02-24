var request = exports.request = function (options, done) {
  switch (options.protocol) {
    case 'http:':
      return require('http').request(options, done);
    case 'https:':
      return require('https').request(options, done);
    default:
      throw new Error('unknown protocol');
  }

};

// buffer response body
var bufferBody = exports.bufferBody = function (done) {
  return function (res) {
    var body = "";
    res.on('data', function (data) {
      body += data;
    });
    res.on('end', function () {
      done(null, body);
    });
    res.on('error', function (err) {
      done(err);
    });
  };
};

// buffer response body
var bufferBodyJSON = exports.bufferBodyJSON = function (done) {
  return bufferBody(function (err, body) {
    if (err) {
      done(err);
    } else {
      try {
        done(null, JSON.parse(body));
      } catch (e) {
        done(e);
      }
    }
  });
};

var methods = [
  'get',
  'post',
  'put',
  'delete'
];

methods.forEach(function (method) {
  exports[method + 'JSON'] = function (path, body, done) {
    var options = {
      path: path,
      method: method,
      withCredentials: false // allows cors
    };
    request(options, bufferBodyJSON(done)).end();
  };
});
