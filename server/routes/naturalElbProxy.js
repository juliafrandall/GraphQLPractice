'use strict';

var request = require('request');
var _ = require('lodash');

module.exports = function trackApi(req, res, next) {
  var options = {
    url:     'http://natural-elb.nixinternal.com' + req.params[0], //URL to hit
    method:  req.method, //Specify the method
    headers: { //We can define headers too
      'Content-Type': req.headers['content-type'],
    },
    qs:      req.query
  };

  if (req.rawBody) {
    options.body = req.rawBody;
  }

  request(options, function (error, response, body) {
    if (response && response.headers) {
      _.forEach(response.headers, function (value, key) {
        res.setHeader(key, value);
      });
    }
    res.status(response && response.statusCode || 500).send(error || body);
  });
};
