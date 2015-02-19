var $ = require('jquery');

var blobs;

var getBlobs = exports.getBlobs = function (done) {
  if (blobs === undefined) {
    $.getJSON('http://192.168.1.66:3000/search', function (b) {
      blobs = b;
      done(b);
    });
  } else {
    done(blobs);
  }
};

exports.getBlobById = function (id, done) {
  getBlobs(function (blobs) {
    done(
      blobs.filter(function (blob) {
        return blob._id === id;
      })[0]
    );
  });
};
