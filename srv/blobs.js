var cas = require('content-addressable-store'),
    hash = 'sha1',
    db = cas('./blobs/sha1', hash);

var meta = require('./meta');

exports.setup = function (app) {

  app.get('/blobs', function (req, res) {
    // cas never call callback if no items are in db
    db.all(function (err, list) {
      if (err) {
        res.status(500).json(err);
      } else {
        res.json(list.filter(function (item) {
          return !item.match(/^tmp/);
        }).map(function (item) {
          return 'sha1-' + item
        }));
      }
    });
  });

  app.get('/blobs/:id/:name?', meta.check, function (req, res) {

    var id = req.params.id.slice(5);

    var range = req.headers.range || 'bytes=0-';
    var positions = range.replace(/bytes=/, "").split("-");
    var start = parseInt(positions[0], 10);

    db.has(id, function (err, stats) {
      if (err) {
        res.status(500).json(err);
      } else {
        var total = stats.size;
        var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
        var chunksize = (end - start) + 1;

        res.status(206);

        res.set({
          'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': req.meta.mime
        });

        db.getStream(id, {
          start: start,
          end: end
        }).pipe(res);

      }
    });

  });

  app.put('/blobs', function (req, res) {
    req
      .pipe(db.addStream())
      .on('error', function (err) {
        res.status(500).json(err);
      })
      .on('close', function () {
        res.status(201).json(hash + '-' + this.hash);
      })
  });

};
