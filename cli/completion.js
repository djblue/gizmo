var log = require('../lib/log');

var path = require('path'),
    bin = path.basename(process.argv[1]);

var tabtab = require('tabtab');

exports.description = 'Generate autocompletion';

exports.usage = function (bin, cmd) {
  console.log('USAGE: . <(' + bin + ' ' + cmd + ')');
};

var fs = require('fs');

var cmds = fs.readdirSync(__dirname)
  .filter(function (file) {
    // only include js files and not this index file
    return file.match(/\.js$/) && !file.match('index');
  })
  .map(function (file) {
    // remove file extensions
    return file.replace('.js', '')
  });

exports.run = function (args) {

  tabtab.complete(bin, function(err, data) {

    // simply return here if there's an error or data not provided.
    // stderr not showing on completions
    if(err || !data) return;

    if (/^--\w?/.test(data.last)) {
      return tabtab.log(['debug', 'verbose'], data, '--');
    }

    if (/^-\w?/.test(data.last)) {
      return tabtab.log(['d'], data, '-');
    }

    tabtab.log(cmds, data);
    //tabtab.log(['list','of','commands'], data);

  });

  // log debug info, super helpful
  log.bug('bin = ' + bin);
  log.bug('__dirname = ' + __dirname);
  log.bug(cmds);
};
