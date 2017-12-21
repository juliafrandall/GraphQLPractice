'use strict';

const logger = require(require('path').join(__rootdirname, 'server', 'logger.js'));

const router  = require('express').Router();
const db      = require('knex').db;
const aurora  = require('knex').aurora;
const csv     = require('csv');
const moment  = require('moment-timezone');
const request = require('request-promise');
const _       = require('lodash');

const x3ScaleBypass = 'c49e69471a7b51beb2bb0e452ef53867385f7a5a';

function fetchMe(trackApiToken) {
  return request({
    method:  'GET',
    url:     'https://trackapi.nutritionix.com/v2/me',
    headers: {
      'x-3scale-bypass': x3ScaleBypass,
      'x-user-jwt':      trackApiToken
    },
    json:    true
  })
    .then(me => {
      me.fileName = [me.first_name, me.last_name]
        .filter(v => !!(v || '').trim())
        .join(' ')
        .replace(/\s/g, '-');

      return me;
    })
}

function fetchRecords(endpoint, attribute, token, timezone, begin, end) {
  let limit = 100, offset = 0, res = {};

  res[attribute] = [];

  function loadLog() {
    return request({
      method:  'GET',
      url:     `https://trackapi.nutritionix.com/v2${endpoint}`,
      headers: {
        'x-3scale-bypass': x3ScaleBypass,
        'x-user-jwt':      token
      },
      qs:      {timezone, begin, end, limit, offset},
      json:    true
    })
      .then(response => {
        let records = response[attribute];

        if (records.length > 0) {
          res[attribute] = res[attribute].concat(records);
          offset += limit;
        }

        if (records.length === limit) {
          return loadLog();
        }

        return res;
      });
  }

  return loadLog();
}

router.get('/log', debugReplaceToken, function () {
  function getNutrientValue(nutrients, id) {
    for (let i = 0; i < nutrients.length; i += 1) {
      if (nutrients[i].attr_id === id) {
        return nutrients[i].value;
      }
    }

    return null;
  }

  function ucwords(string) {
    return (string && string.toString() || '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
      return $1.toUpperCase();
    });
  }

  let meals = {
    1: 'Breakfast',
    2: 'Morning Snack',
    3: 'Lunch',
    4: 'Afternoon Snack',
    5: 'Dinner',
    7: 'Anytime'
  };

  return function (req, res, next) {
    let user;
    let timezone = req.query.timezone || "US/Eastern";

    fetchMe(req.cookies.trackApiToken)
      .then(function (me) {
        user = me;
        return fetchRecords(
          '/log', 'foods',
          req.cookies.trackApiToken,
          timezone,
          req.query.begin,
          moment(req.query.end).add(1, 'day').format('YYYY-MM-DD')
        );
      })
      .then(function (response) {
        let foods = response.foods;
        let rows  = foods.map(function (food) {
          return [
            moment(food.consumed_at).tz(timezone).format('YYYY-MM-DD'),
            moment(food.consumed_at).tz(timezone).format('HH:mm'),
            food.meal_type ? meals[food.meal_type] : null,
            ucwords(food.food_name),
            ucwords(food.brand_name),
            food.note,
            food.serving_qty,
            food.serving_unit,
            food.serving_weight_grams,
            getNutrientValue(food.full_nutrients, 208),
            getNutrientValue(food.full_nutrients, 204),
            getNutrientValue(food.full_nutrients, 606),
            getNutrientValue(food.full_nutrients, 307),
            getNutrientValue(food.full_nutrients, 205),
            getNutrientValue(food.full_nutrients, 291),
            getNutrientValue(food.full_nutrients, 269),
            getNutrientValue(food.full_nutrients, 203),
            getNutrientValue(food.full_nutrients, 306),
            getNutrientValue(food.full_nutrients, 305)
          ];
        });
        rows.push([
          'Date', 'Time', 'Meal',
          'Food Name', 'Brand Name', 'Notes',
          'serving qty', 'serving unit', 'serving weight grams',
          'calories', 'fat', 'saturated fat',
          'sodium', 'total carb', 'fiber',
          'sugar', 'protein', 'potassium', 'phosphorus'
        ]);

        rows = rows.reverse();

        let fileName = `${user.fileName}_food-log_${req.query.begin}_${req.query.end}`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}.csv`);
        csv.stringify(rows, function (err, csvString) {
          res.end(csvString);
        });
      })
      .catch(error => {
        logger.error(error);
        res.status(500).end('Could not generate report');
      });
  }
}());

router.get('/weight', debugReplaceToken, function (req, res, next) {
  let user;
  let timezone = req.query.timezone || "US/Eastern";

  fetchMe(req.cookies.trackApiToken)
    .then(function (me) {
      user = me;
      return fetchRecords(
        '/weight/log', 'weights',
        req.cookies.trackApiToken,
        timezone,
        req.query.begin,
        moment(req.query.end).add(1, 'day').format('YYYY-MM-DD')
      );
    })
    .then(function (response) {
      let records = response.weights;

      let rows = records.map(function (record) {
        return [
          moment(record.timestamp).tz(timezone).format('YYYY-MM-DD'),
          moment(record.timestamp).tz(timezone).format('HH:mm'),
          _.round(record.kg, 1),
          _.round(record.kg * 2.20462262, 1)
        ];
      });

      rows.push([
        'Date', 'Time', 'Weight KG', 'Weight LBS'
      ]);

      rows = rows.reverse();

      let fileName = `${user.fileName}_weight-log_${req.query.begin}_${req.query.end}`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}.csv`);
      csv.stringify(rows, function (err, csvString) {
        res.end(csvString);
      });
    })
    .catch(error => {
      logger.error(error);
      res.status(500).end('Could not generate report');
    });
});

router.get('/exercise', debugReplaceToken, function (req, res, next) {
  let user;
  let timezone = req.query.timezone || "US/Eastern";

  fetchMe(req.cookies.trackApiToken)
    .then(function (me) {
      user = me;
      return fetchRecords(
        '/exercise/log', 'exercises',
        req.cookies.trackApiToken,
        timezone,
        req.query.begin,
        moment(req.query.end).add(1, 'day').format('YYYY-MM-DD')
      );
    })
    .then(function (response) {
      let records = response.exercises;

      let rows = records.map(function (record) {
        return [
          moment(record.timestamp).tz(timezone).format('YYYY-MM-DD'),
          moment(record.timestamp).tz(timezone).format('HH:mm'),
          record.name,
          record.duration_min,
          record.nf_calories,
          record.compendium_code,
          record.met
        ];
      });

      rows.push([
        'Date', 'Time',
        'Name', 'Duration Minutes', 'Calories Burned',
        'Compendium Code', 'Met'
      ]);

      rows = rows.reverse();

      let fileName = `${user.fileName}_exercise-log_${req.query.begin}_${req.query.end}`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}.csv`);
      csv.stringify(rows, function (err, csvString) {
        res.end(csvString);
      });
    })
    .catch(error => {
      logger.error(error);
      res.status(500).end('Could not generate report');
    });
});

router.get('/histogram', debugReplaceToken, function () {
  return function (req, res, next) {
    let user;

    fetchMe(req.cookies.trackApiToken)
      .then(function (me) {
        user = me;
        return request({
          method:  'GET',
          url:     'https://trackapi.nutritionix.com/v2/reports/nutrients/histogram',
          headers: {
            'x-3scale-bypass': 'c49e69471a7b51beb2bb0e452ef53867385f7a5a',
            'x-user-jwt':      req.cookies.trackApiToken
          },
          qs:      {
            attr_ids: JSON.stringify([208, 301, 291, 306, 324, 303]),
            begin:    req.query.begin,
            end:      moment(req.query.end).add(1, 'day').format('YYYY-MM-DD'),
          },
          json:    true
        })
      })
      .then(function (response) {
        let histogram = response.histogram.filter(data => data.attr_ids[208].value >= user.daily_kcal / 2);
        let rows      = histogram.map(function (histogramItem) {
          return [
            histogramItem.date,
            _.round(histogramItem.attr_ids[208].value),
            _.round(histogramItem.attr_ids[301].value),
            _.round(histogramItem.attr_ids[291].value),
            _.round(histogramItem.attr_ids[306].value),
            _.round(histogramItem.attr_ids[324].value),
            _.round(histogramItem.attr_ids[303].value),
          ];
        });
        rows.push([
          'Date',
          'Calorie (kcal)',
          'Calcium (mg)',
          'Fiber (g)',
          'Potassium (mg)',
          'Vitamin D (IU)',
          'Iron (mg)'
        ]);

        rows = rows.reverse();

        let fileName = `${user.fileName}_nutrient-histogram_${req.query.begin}_${req.query.end}`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}.csv`);
        csv.stringify(rows, function (err, csvString) {
          res.end(csvString);
        });
      })
      .catch(error => {
        logger.error(error);
        res.status(500).end('Could not generate report');
      });
  }
}());

function debugReplaceToken(req, res, next) {
  if (process.env.TRACK_USER_ID && aurora) {
    aurora
      .select('token')
      .from('nutritionix-track-2.users_tokens')
      .where('user_id', '=', process.env.TRACK_USER_ID)
      .orderBy('created_at', 'desc')
      .limit(1)
      .then(function (rows) {
        let token = rows[0] && rows[0].token;

        if (token) {
          req.cookies.trackApiToken = token;
        }

        next();
      })
  } else {
    next();
  }
}

module.exports = router;
