'use strict';

var config = require('../config');
var knex = require('knex').db;
var hashids = require('hashids').instance;
var moment = require('moment-timezone');

var router = module.exports = require('express').Router();

router.get('/foods-to-limit/:userId', function (req, res, next) {
  var id = hashids.decode(req.params.userId)[0];

  var begin = moment.tz(req.query.begin, req.query.timezone).utc().format('YYYY-MM-DD HH:mm:ss');
  var end = moment.tz(req.query.end, req.query.timezone).utc().format('YYYY-MM-DD HH:mm:ss');

  knex
    .select(knex.raw([
      '(nf_calories/serving_weight_grams) AS cal_density,\
       count(*) AS food_ct,\
       AVG(nf_calories) AS avg_portion_calories,\
       ufl.food_name'
    ]))
    .from('nutritionix-track-2.users_food_logs as ufl')
    .where('ufl.consumed_at', '>=', begin)
    .where('ufl.consumed_at', '<', end)
    .where('user_id', '=', id)
    .whereNotNull('serving_weight_grams')
    .groupBy('food_name')
    .having('cal_density', '>', 2)
    .having('avg_portion_calories', '>', 200)
    .orderBy('avg_portion_calories', 'desc')
    .limit(5)
    //.on('query', function (data) {console.log(data);})
    .then(function (rows) {
      res.json(rows);
    })
    .catch(next)
});
