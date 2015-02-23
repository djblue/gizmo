var log = require('../lib/log');

var mkdirp = require('mkdirp');
var path = require('path');
var jf = require('jsonfile');

function getUserHome () {
  return process.env[(process.platform == 'win32')? 'USERPROFILE' : 'HOME'];
}

var CONFIG_PATH = path.resolve(getUserHome(), '.gizmo');
var CONFIG_FILE = path.resolve(CONFIG_PATH, 'config.json');

log.bug('CONFIG_PATH = ' + CONFIG_PATH);
log.bug('CONFIG_FILE = ' + CONFIG_FILE);

mkdirp.sync(CONFIG_PATH);

exports.description = "Manage gizmo config information";

exports.set = function (config) {
  log.bug('writing config file');
  log.bug(config);
  return jf.writeFileSync(CONFIG_FILE, config);
};

exports.get = function () {
  log.bug('reading config file');
  return jf.readFileSync(CONFIG_FILE);
};
