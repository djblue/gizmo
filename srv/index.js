var express = require('express');

var app = express();
var fs = require('fs');
var path = require('path');
var morgan = require('morgan');
var compression = require('compression');

app.use(compression());
app.use(morgan('dev'));

// enable cors on all routes
app.use(require('cors')());

var bodyParser = require('body-parser');

app.use(bodyParser.json());

var logo = fs.readFileSync(path.join(__dirname, 'logo.txt'), 'utf8');

console.log(logo);

require('../web/').setup(app);

// make sure auth is before all other end points
// but after the web ui
require('./auth').setup(app);

require('./blobs').setup(app);
require('./meta').setup(app);
require('./tags').setup(app);
require('./archive').setup(app);
require('./status').setup(app);

app.listen(3000);
