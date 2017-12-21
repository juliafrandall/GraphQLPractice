'use strict';

const path   = require('path');
const logger = require(path.join(__rootdirname, 'server', 'logger.js'));


const router      = require('express').Router();
const config      = require('../config');
const db          = require('knex').db;
const querystring = require('querystring');
const bluebird    = require('bluebird');
const _           = require('lodash');
const request     = require('request-promise');
const moment      = require('moment-timezone');

const AWS = require('aws-sdk');
const ses = new AWS.SES();

const validateRecaptchaMiddleware = require(path.join(__rootdirname, 'server', 'lib', 'validateRecaptchaMiddleware'))();

const entities = new (require('html-entities').AllHtmlEntities)();

const alphabet = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

/*******
 /POST
 *******/
router.post('/:customer_id', validateRecaptchaMiddleware, validateAccessKey, getCustomerInfo);
router.put('/:customer_id/update-card-info', validateAccessKey, updateCardInfo);

function validateAccessKey(req, res, next) {
  db('hive2.stripe_customers_tokens')
    .select('*')
    .where({
      token:       req.body.key,
      customer_id: req.params.customer_id
    })
    .on('query', d => console.log(d))
    .then(rows => {
      if (!rows.length) {
        res.status(403).json({message: 'Invalid access key'});
        return;
      }

      const hive2Token = rows[0];

      if (moment().isAfter(moment(hive2Token.expires_at))) {
        res.status(403).json({message: 'Expired access key'});
        return;
      }

      next();
    })
    .catch(next)
}

function getCustomerInfo(req, res, next) {
  db('hive2.stripe_customers')
    .select(['id', 'email', 'description'])
    .where('id', '=', req.params.customer_id)
    .then(rows => {
      if (rows.length) {
        res.json(rows[0]);
      } else {
        res.status(404).json({message: 'stripe customer was not found'})
      }
    })
    .catch(next)
}

function updateCardInfo(req, res, next) {
  request({
    method: 'POST',
    url:    `https://api.stripe.com/v1/customers/${req.params.customer_id}/sources`,
    json:   true,
    auth:   {
      // user:     process.env.STRIPE_SECRET_KEY,
      user:     config.stripe.secret_key,
      password: ''
    },
    form:   {
      source: req.body.token.id
    }
  })
    .then(card => {
      console.log(card);

      return request({
        method: 'POST',
        url:    `https://api.stripe.com/v1/customers/${req.params.customer_id}`,
        json:   true,
        auth:   {
          user:     config.stripe.secret_key,
          password: ''
        },
        form:   {
          default_source: card.id
        }
      })
    })
    .then(customer => {
      console.log(customer.sources);

      res.json({message: 'success'})
    })
    .catch(next)
}

module.exports = router;
