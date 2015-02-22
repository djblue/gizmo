var log = require('../lib/log');

// basic authenticatin with jwt
var jwt = require('jwt-simple');

// config should contain secret for
var config = require('./config');

exports.setup = function (app) {

  app.post('/auth', function (req, res) {
    if(req.body.name === config.user.name &&
       req.body.pass === config.user.pass) {

      res.json({
        token: jwt.encode({
          admin: true,
          issued: (new Date())
        }, config.secret)
      });

    } else {

      res.status(400).json({
        message: 'incorrect login'
      });

    }
  });

  // enable auth on all api routes
  // check http header for TOKEN
  // ex: Authorization: Bearer TOKEN
  app.use(function (req, res, next) {
    if (req.headers.authorization === undefined) {
      res.status(400).json({
        message: 'need to provide \'Authorization\' header'
      });
    } else {
      var token = req.headers.authorization.match('Bearer (.*)')[1];
      if (token === undefined) {
        res.status(400).json({
          message: 'malformed \'Authorization\' header'
        });
      } else {
        try {
          var decoded = jwt.decode(token, config.secret);
          if (decoded.admin === undefined) {
            res.status(403).json({
              message: 'unknown user - reauthenticate'
            });
          } else {
            next();
          }
        } catch (_) {
          res.status(400).json({
            message: 'malformed \'Authorization\' header'
          });
        }
      }
    }
  });

};
