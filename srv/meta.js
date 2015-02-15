var nedb = require('nedb'),
    meta = new nedb({
      filename: './blobs/meta.db',
      autoload: true
    });

exports.check = function (req, res, next) {
  meta.find({ _id: req.params.id }, function (err, meta) {
    if (err) {
      res.status(500).json(err);
    } else {
      req.meta = meta[0] || {};
      next();
    }
  });
};

exports.setup = function (app) {

  app.get('/meta/:id', function (req, res) {
    meta.findOne({ _id: req.params.id }, function (err, meta) {
      if (err) {
        res.status(500).json(err);
      } else if (meta === null) {
        res.status(404).json({
          message: 'Not found.',
          id: req.params.id
        });
      } else {
        res.json(meta);
      }
    });
  });


  app.put('/meta/:id', function (req, res) {
    req.body._id = req.params.id;
    meta.update({ _id: req.params.id }, req.body, { upsert: true }, function (err, count) {
      if (err) {
        res.status(500).json(err);
      } else {
        res.json(count);
      }
    });
  });

  app.get('/search', function (req, res) {
    meta.find(req.query, function (err, result) {
      if (err) {
        res.status(500).json(err);
      } else {
        res.json(result);
      }
    });
  });

};
