'use strict';

var request = require('request');
var _       = require('lodash');
var db      = require('knex').aurora;
var bb      = require('bluebird');

module.exports = function trackApi(req, res, next) {
  const options = {
    url:     (process.env.TRACK_API_HOST || 'https://trackapi.nutritionix.com') + req.params[0],
    method:  req.method,
    headers: _.merge(
      {},
      _.pick(req.headers, ['content-type']),
      {'x-3scale-bypass': 'c49e69471a7b51beb2bb0e452ef53867385f7a5a'}
    ),
    qs:      req.query
  };

  let flow = bb.resolve(true);

  if(req.headers['x-user-jwt']){
    options.headers['x-user-jwt'] = req.headers['x-user-jwt'];

    if (process.env.TRACK_USER_ID && db) {
      flow = db
        .select('token')
        .from('nutritionix-track-2.users_tokens')
        .where('user_id', '=', process.env.TRACK_USER_ID)
        .orWhereRaw('user_id = (SELECT id from `nutritionix-track-2`.users where email = ?)',[ process.env.TRACK_USER_ID])
        .orderBy('created_at', 'desc')
        .limit(1)
        .then(function (rows) {
          let token = rows[0] && rows[0].token;

          if (token) {
            options.headers['x-user-jwt'] = token;
          }
        })
    }
  }

  //options.qs.errorBypass = '4304c235f2ebca17da40';

  flow = bb.all([flow,
    req.rawBodyPromise.then(body => {
      if (body.length) {
        options.body = body;
      }
    })]);

  flow.then(function () {
    request(options, function (error, response, body) {
      if (response && response.headers) {
        _.forEach(response.headers, function (value, key) {
          res.setHeader(key, value);
        });
      }
      res.status(response && response.statusCode || 500).send(error || body);
    });
  });
};
