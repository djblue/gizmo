var http = require('http');

exports.usage = function (bin, cmd) {
  console.log('Usage: ' + bin + ' ' + cmd+ ' [OPTIONS] sha1-hash\n');
  console.log(desc);
};

var desc = exports.description = "Get content from gizmod";

exports.run = function (args) {

  var options = {
    hostname: 'localhost',
    port: 3000,
    path: '/' + process.argv[2],
    method: 'GEt'
  };

  var req = http.request(options, function(res) {

    //process.stderr.write('STATUS: ' + res.statusCode);
    //process.stderr.write('HEADERS: ' + JSON.stringify(res.headers));

    res.pipe(process.stdout);

  }).end();

};
