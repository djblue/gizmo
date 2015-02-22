var meta = require('./meta').db;

var Unrar = require('unrar');
var path = require('path');

exports.setup = function (app) {

  app.get('/archive/:id', function (req, res) {
    meta.findOne({ _id: req.params.id }, function (err, doc) {
      if (err) {
        res.status(500).json(err);
      } else {
        var archive = new Unrar(path.join(__dirname, '../blobs/sha1/3c/5961a47a30c81e98258b37e878840373b38e5d'));
        archive.list(function (err, entries) {
          if (err) {
            res.status(500).json(err);
          } else {
            res.json(entries.sort(function (a, b) {
              return a.name > b.name;
            }));
          }
        });
      }
    })
  });

  app.get('/archive/:id/entry', function (req, res) {
    meta.findOne({ _id: req.params.id }, function (err, doc) {
      if (err) {
        res.status(500).json(err);
      } else {
        var archive = new Unrar(path.join(__dirname, '../blobs/sha1/3c/5961a47a30c81e98258b37e878840373b38e5d'));
        archive.list(function (err, entries) {
          if (err) {
            res.status(500).json(err);
          } else {
            var stream = archive.stream(req.query.path);
            stream.on('error', function (err) {
              console.log(err);
            });
            stream.pipe(res);
          }
        });
      }
    })
  });

};
