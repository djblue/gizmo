var f4js = require('fuse4js');
var fs = require('fs');
var pth = require('path');
var qs = require('querystring');

var lib = require('../lib');
var log = lib.log;
var config = lib.config;
var client = lib.client;
var path = pth.join(config.getUserHome(), '.gizmo', 'cache');
var exec = require('child_process').execSync;

var blobsCache;

exports.usage = function (bin, cmd) {
  console.log('USAGE: ' + bin + ' ' + cmd + ' <dir>');
};

exports.run = function (args) {

var cache = lib.cache(path);

var paths = {
  '/list': {
    read: function (path, done) {
      client.getJSON('/search', function (err, blobs) {
        if (err) {
          log.err(err);
          done(err);
        } else {
          blobsCache = blobs;
          log.bug('blobs.length = ' + blobs.length);
          done(0, blobs.map(function (blob) {
            return blob.filename;
          }));
        }
      });
    },
    stat: function (path, done) {
      try {
        path = pth.basename(path);
        var blob = blobsCache.filter(function (blob) {
          return blob.filename === path;
        })[0];
        done(0, {
          size: blob.size,
          mode: 0100644,   // file with 644 permissions
          mtime: new Date(blob.uploaded)
        });
      } catch (e) {
        done(-2);
      }
    }
  },
  '/': {
    read: function (path, done) {
      done(0, ['list']);
    },
    stat: function (path, done) {
      done(0, {
        size: 4096,   // standard size of a directory
        mode: 040755  // directory with 777 permissions
      });
    },
  }
};


function getattr(path, done) {
  log.bug('getattr: ' + path);
  for (var key in paths) {
    if (pth.dirname(path).match(key)) {
      return paths[key].stat(path, done);
    }
  }
  done(-2); // -ENOENT
}

function readdir(path, done) {
  log.bug('readdir: ' + path);
  for (var key in paths) {
    if (path.match(key)) {
      return paths[key].read(path, done);
    }
  }
  done(-2); // -ENOENT
}

function readlink(path, cb) {
  var path = pth.join(srcRoot, path);
  return fs.readlink(path, function readlinkCb(err, name) {
    if (err)
      return cb(-excToErrno(err));
    var name = pth.resolve(srcRoot, name);
    return cb(0, name);
  });
}

function chmod(path, mode, cb) {
  log.bug('chmod: ' + path);
  return cb(0);
}

function open(path, flags, cb) {
  log.bug('open: ' + path);
  cb(0);
}

function read(path, offset, len, buf, fh, done) {
  log.bug('read: path = ' + path + ' offset = ' + offset + ' len = ' + len);
  log.bug('buf.len  = ' + buf.length);
  path = pth.basename(path);
  try {
    var blob = blobsCache.filter(function (blob) {
      return blob.filename === path;
    })[0];
    var key = blob._id + '-' + offset + '-' + len;
    cache.async(key, function (done) {
      var opts = {
        path: '/blobs/' + blob._id,
        headers: {
          range: 'bytes=' + offset + '-' + (offset + len - 1)
        }
      };
      var req = client.get(opts, function (res) {
        var buff = new Buffer(buf.length);
        var bytes = 0;
        res.on('data', function (data) {
          data.copy(buff, bytes);
          bytes += data.length;
        });
        res.on('error', done);
        res.on('end', function () {
          done(null, buff);
        });
      });
      req.on('error', done);
      req.end();
    }, function (err, data) {
      if (err) {
        log.err(err);
        done(-2);
      } else {
        (new Buffer(data)).copy(buf);
        done(data.length);
      }
    });
  } catch (e) {
    log.err(e);
    done(-2);
  }
}

function write(path, offset, len, buf, fh, cb) {
  cb(-1);
}

function release(path, fh, cb) {
  log.bug('release: path = ' + path);
  cb(-1);
}

function create (path, mode, cb) {
  log.bug('create: path = ' + path);
  cb(-1);
}

function unlink(path, cb) {
  log.bug('unlink: path = ' + path);
  cb(-1);
}

function rename(src, dst, cb) {
  log.bug('rename: src = ' + src + ' dst = ' + dst);
  cb(-1);
}

function mkdir(path, mode, cb) {
  log.bug('mkdir: path = ' + path);
  cb(-1);
}

function rmdir(path, cb) {
  log.bug('rmdir: path = ' + path);
  cb(-1);
}

function init (cb) {
  console.log("mounted at " + args._[1]);
  cb();
}

function destroy (cb) {
  log.bug("file system stopped");
  cb();
}

function statfs(cb) {
  cb(0, {
      bsize: 1000000,
      frsize: 1000000,
      blocks: 1000000,
      bfree: 1000000,
      bavail: 1000000,
      files: 1000000,
      ffree: 1000000,
      favail: 1000000,
      fsid: 1000000,
      flag: 1000000,
      namemax: 1000000
  });
}

var handlers = {
  getattr: getattr,
  readdir: readdir,
  readlink: readlink,
  chmod: chmod,
  open: open,
  read: read,
  write: write,
  release: release,
  create: create,
  unlink: unlink,
  rename: rename,
  mkdir: mkdir,
  rmdir: rmdir,
  init: init,
  destroy: destroy,
  statfs: statfs
};

var dir = args._[1];

if (dir === undefined) {
  log.err('please specify target');
  process.exit(1);
} else {
  try {
    process.on('SIGINT', function () {
      console.log('\nrecieved signal SIGINT (Ctrl-C)');
      exec('fusermount -u ' + dir);
      console.log('unmounted ' + dir);
    });
    f4js.start(dir, handlers);
  } catch (e) {
    console.log("Exception when starting file system: " + e);
  }
}

};
