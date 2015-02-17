var express = require('express');

var app = express();
var fs = require('fs');
var path = require('path');
var morgan = require('morgan');
var compression = require('compression');

app.use(compression());
app.use(morgan('dev'));

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

var bodyParser = require('body-parser');

app.use(bodyParser.json());

var logo = fs.readFileSync(path.join(__dirname, 'logo.txt'), 'utf8');

console.log(logo);

require('./blobs').setup(app);
require('./meta').setup(app);
require('./tags').setup(app);
require('./archive').setup(app);
require('./status').setup(app);

app.listen(3000);
