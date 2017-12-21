'use strict';

const path        = require('path');
const bluebird    = require('bluebird');
const request     = require('request-promise');
const _           = require('lodash');
const querystring = require('querystring');
const logger      = require(path.join(__rootdirname, 'server', 'logger.js'));
const config      = require(path.join(__rootdirname, 'server', 'config'));

module.exports = function (getRecaptchaResponse = req => req.body.recaptcha) {
  return function validateRecaptchaMiddleware(req, res, next) {
    request({
      method:  'POST',
      url:     'https://www.google.com/recaptcha/api/siteverify',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body:    querystring.stringify({
        secret:   config.recaptcha.secret,
        response: getRecaptchaResponse(req)
      })
    }).then(function (body) {
      body = _.isString(body) ? JSON.parse(body) : body;
      if (!body.success) {
        return bluebird.reject(new Error(JSON.stringify(body)));
      }

      next();
    }).catch(function (response) {
      logger.error(response);
      res.status(403).json({
        message: 'reCAPTCHA validation failed'
      })
    });
  }
};
