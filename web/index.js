var path = require('path');
var express = require('express');

exports.setup = function (app) {
  app.use('/', express.static(path.join(__dirname, 'dist')));
};
