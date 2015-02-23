var lib = require('../lib');
var log = lib.log;
var client = lib.client;

exports.description = "List all blobs from gizmod";

exports.run = function () {

  client.getJSON('/blobs', function(err, body) {
    if (err) {
      log.err(err);
    } else {
      console.log(body.join('\n'));
    }
  });

};
