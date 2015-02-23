var log = require('./log');

var request = exports.request = function (options, done) {
  switch (options.protocol) {
    case 'http:':
      log.bug('making http request to ' + options.host)
      return require('http').request(options, done);
    case 'https:':
      log.bug('making https request to ' + options.host)
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
      log.bug('recieved ' + data.length + ' bytes');
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

exports.getJSON = function (options, done) {
  log.bug('getting json from ' + options.host);
  options.method = 'GET';
  request(options, bufferBodyJSON(done)).end();
};
