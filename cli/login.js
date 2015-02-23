var lib = require('../lib');
var log = lib.log;
var config = lib.config;
var request = lib.http.request;

var url = require('url');
var colors = require('colors');
var prompt = require('prompt');
var validUrl = require('valid-url');
var fs = require('fs');

var login = function (creds, args) {

  var options = url.parse(creds.url);

  options.method = 'POST';
  options.path = '/auth';

  options.headers = {
    'Content-Type': 'application/json'
  };

  if (args['ca'] !== undefined) {
    log.bug('using ca = ' + args['ca']);
    options.ca = fs.readFileSync(args['ca'], 'utf8');
  }

  var req = request(options, function (res) {

    var body = "";

    res.on('data', function (data) {
      body += data;
    });

    res.on('end', function () {
      try {
        body = JSON.parse(body);
        if (res.statusCode !== 200 || body.token === undefined) {
          log.err('statusCode = ' + res.statusCode);
          log.err(body);
        } else {
          config.set({
            url: creds.url,
            ca: options.ca,
            token: body.token
          }); console.log('login successful');
        }
      } catch (err) {
        log.err(err);
        log.err(body);
      }
    });

    res.on('error', log.err)

  });

  var body = JSON.stringify({
    name: creds.name,
    pass: creds.pass
  });

  req.write(body);
  req.end();

  req.on('error', log.err);
};

exports.description = "Login to a gizmod instance";

exports.usage = function (bin, cmd) {
  console.log('Usage: ' + bin + ' ' + cmd + ' [OPTIONS]');
  console.log('Options:\n')
  console.log('    --ca    Provide ca for self signed https certs')
};

exports.completion = function (tabtab, data) {
  if (/^--\w?/.test(data.last)) {
    return tabtab.log([
      'ca',
    ], data, '--');
  }
};

exports.run = function (args) {

  var schema = {
    properties: {
      url: {
        description: 'url'.blue + ':',
        default: 'http://localhost:3000',
        required: true,
        conform: validUrl.isWebUri,
        message: 'not a valid web url'
      },
      name: {
        description: 'name'.blue + ':',
        pattern: /^[a-zA-Z\s\-]+$/,
        message: 'not a valid name (no spaces)',
        required: true
      },
      pass: {
        description: 'pass'.blue + ':',
        required: true,
        hidden: true
      }
    }
  };
 
  // start the prompt 
  prompt.start();

  // default prompt is too much! get ride of it.
  prompt.delimiter = '';
  prompt.message = '';
 
  // get the info
  prompt.get(schema, function (err, input) {
    if (err) {
      log.bug(err);
      process.exit(1);
    } else {
      login(input, args);
    }
  });

};
