'use strict';

const logger = require(require('path').join(__rootdirname, 'server', 'logger.js'));

const router  = require('express').Router();
const db      = require('knex').db;
const aurora  = require('knex').aurora;
const csv     = require('csv');
const moment  = require('moment-timezone');
const request = require('request-promise');
const _       = require('lodash');

router.get('/twitter-analyzer', function (req, res, next) {
  db.select(['timestamp as time', db.raw('CAST(tweet_id as CHAR) as tweet_id'), 'text as tweet', 'parsed_result as foods', 'twitter_handle as user'])
    .from('hive2.nlp_tweets')
    .orderBy('timestamp', 'desc')
    .limit(20)
    .then(function (rows) {
      rows.forEach(function (tweet) {
        try {
          tweet.foods = JSON.parse(tweet.foods);
        } catch (e) {
          tweet.foods = [];
        }
      });
      res.json(rows)
    })
    .catch(function (error) {
      logger.error(error);
      res.status(500).send('failed to query latest tweets');
    })
});

router.get('/twitter-analyzer/:id', function (req, res, next) {
  db.select(['timestamp as time', db.raw('CAST(tweet_id as CHAR) as tweet_id'), 'text as tweet', 'parsed_result as foods', 'twitter_handle as user'])
    .from('hive2.nlp_tweets')
    .where('tweet_id', '=', req.params.id)
    .then(function (rows) {
      var tweet = rows[0];
      if (!tweet) {
        res.status(404).send('tweet not found');
        return;
      }

      try {
        tweet.foods = JSON.parse(tweet.foods);
      } catch (e) {
        tweet.foods = [];
      }
      res.json(tweet);
    })
    .catch(function (error) {
      logger.error(error);
      res.status(500).send('failed to query latest tweets');
    })
});

router.get('/locate-test', function (req, res, next) {
  let {lat, lng, distance} = req.query;

  aurora.raw(`CALL \`nutritionix-locate\`.locations_map(${lat || 0}, ${lng || 0}, ${distance || 1})`)
    .then(dbResposne => {
      res.json({locations: dbResposne[0][0]});
    })
    .catch(function (error) {
      logger.error(error);
      res.status(500).send('failed to locate');
    })
});

module.exports = router;
