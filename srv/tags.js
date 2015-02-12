var nedb = require('nedb'),
    tags = new nedb({
      filename: './blobs/tags.db',
      autoload: true
    });

exports.setup = function (app) {

  // tags
  // {_id: "", members: []} - id acts as a label
  app.get('/tags', function (req, res) {
    tags.find({}, {label: 1}, function (err, tags) {
      if (err) {
        res.status(500).json(err);
      } else {
        res.json(tags.map(function (tag) {
          return tag._id;
        }));
      }
    });
  });

  app.get('/tags/:label', function (req, res) {
    tags.findOne({ _id: req.params.label}, function (err, tag) {
      if (err) {
        res.status(500).json(err);
      } else if (tag === null) {
        res.status(404).json({
          message: 'Not found.',
          id: req.params.id
        });
      } else {
        res.json(tag.members);
      }
    });
  });

  app.put("/tags/:label", function (req, res) {
    tags.update({ _id: req.params.label }, {
      $addToSet: { members: { $each: req.body } }
    }, { upsert: true }, function (err, count) {
      if (err) {
        res.status(500).json(err);
      } else {
        res.json({ ok: true, count: count })
      }
    });
  });

};
