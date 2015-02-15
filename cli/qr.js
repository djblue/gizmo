var log = require('../lib/log');

var qrcode = require('qrcode-terminal');

exports.run = function (args) {
  var blob = args._[1];
  if (blob === undefined) {
    log.err('Please specify blob hash');
  } else {
    var url = 'http://192.168.1.66:3000/blobs/' + args._[1];
    log.bug(url);
    qrcode.generate(url);
  }
};
