var express = require('express');

var app = express();
var fs = require('fs');
var path = require('path');
var morgan = require('morgan');

app.use(morgan('dev'));

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

var bodyParser = require('body-parser');

app.use(bodyParser.json());

var logo = fs.readFileSync(path.join(__dirname, 'logo.txt'), 'utf8');

console.log(logo);

app.use(express.static(path.join(__dirname, '../web')));
app.use(express.static(path.join(__dirname, '../bower_components')));

var cas = require('content-addressable-store'),
    hash = 'sha1',
    db = cas('./blobs/sha1', hash);

var nedb = require('nedb'),
    meta = new nedb({
      filename: './blobs/meta.db',
      autoload: true
    });

app.get('/search', function (req, res) {
  console.log(req.query);
  meta.find(req.query, function (err, result) {
    if (err) {
      res.status(500).json(err);
    } else {
      res.json(result);
    }
  });
});

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

app.get('/blobs/:id/:name?',

function (req, res, next) {
  meta.find({ _id: req.params.id }, function (err, meta) {
    if (err) {
      res.status(500).json(err);
    } else {
      req.meta = meta[0] || {};
      next();
    }
  });
},

function (req, res) {

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

app.get('/meta/:id', function (req, res) {
  meta.find({ _id: req.params.id }, function (err, meta) {
    if (err) {
      res.status(500).json(err);
    } else if (meta.length === 0) {
      res.status(404).json({
        message: 'Not found.',
        id: req.params.id
      })
    } else {
      res.json(meta[0]);
    }
  });
});


app.put('/meta/:id', function (req, res) {
  req.body._id = req.params.id;
  console.log(req.body);
  meta.update({ _id: req.params.id }, req.body, { upsert: true }, function (err, count) {
    if (err) {
      res.status(500).json(err);
    } else {
      res.json(count);
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

app.listen(3000);
