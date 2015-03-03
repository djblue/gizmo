var lib = require('../lib');
var log = lib.log;

var ytdl = require('ytdl-core');
var fs = require('fs');

var usage = exports.usage = function (bin, cmd) {
  console.log('USAGE: ' + bin + ' ' + cmd + ' <yt-id>');
};

exports.run = function (args) {

  var id = args._[1];

  if (id === undefined) {
    usage();
    process.exit(1);
  }

  var file = fs.createWriteStream('./file.mp4');

  var uri = 'https://www.youtube.com/watch?v=' + id;
  
  ytdl.getInfo(uri, function (err, info) {
    if (err) {
      log.err(err);
    } else {
      console.log(info.title);
      ytdl(uri, {
        filter: 'audioonly'
      }).pipe(file);
    }
  });

};
