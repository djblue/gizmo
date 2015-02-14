var fs = require('fs');
var path = require('path');
var table = require('text-table');
var colors = require('colors');
var log = require('../lib/log');

var bin = path.basename(process.argv[1]);
var args = require('minimist')(process.argv.slice(2));

// usage info
var usage = exports.usage = function () {
  
  console.log('Usage: ' + bin + ' COMMAND [OPTIONS] [arg...]\n');
  console.log('Simple content manager.\n');
  console.log('Options:\n');

  //console.log('-v,--verbose  Enable verbose output')
  console.log('    -d,--debug    Enable debug output\n');

  var commands = fs.readdirSync(__dirname)
    .filter(function (file) {
      // only include js files and not this index file
      return file.match(/\.js$/) && !file.match('index');
    })
    .map(function (file) {
      // remove file extensions
      return file.replace('.js', '')
    })
    .map(function (file) {
      // generate row for the command table
      var cmd = require('./' + file);
      return [
        '    ' + file,
        cmd.description || 'no description'
      ];
    });

    console.log('Commands:\n');
    console.log(table(commands));
    console.log('\nRun \'' + bin + ' help COMMAND\' for more information on a command.');
};

// if no command provided, print usage info
var cmd = args._[0];

if (cmd === undefined) {
  usage();
} else {
  try {
    require('./' + cmd).run(args);
  } catch (e) {
    log.bug(e);
    log.err('Command not found: ' + cmd);
    process.exit(1);
  }
}
