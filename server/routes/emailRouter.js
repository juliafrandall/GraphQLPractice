'use strict';

const path   = require('path');
const logger = require(path.join(__rootdirname, 'server', 'logger.js'));

const emailRouter = require('express').Router();
const config      = require('../config');
const knex        = require('knex').db;
const querystring = require('querystring');
const bluebird    = require('bluebird');
const _           = require('lodash');
const pug         = require('pug');
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
emailRouter.post('/', sendEmail);
emailRouter.post('/secure', validateRecaptchaMiddleware, sendEmail);
emailRouter.post('/share-food-log', shareFoodLog);

/*******
 /FUNCTIONS
 *******/

function generateTicketId() {
  const swearWords = [
    'anus', 'arse', 'clit', 'cock',
    'coon', 'cunt', 'dago', 'damn',
    'dick', 'dike', 'dyke', 'fuck',
    'gook', 'heeb', 'hell', 'homo',
    'jizz', 'kike', 'kunt', 'kyke',
    'mick', 'muff', 'paki', 'piss',
    'poon', 'puto', 'shit', 'shiz',
    'slut', 'smeg', 'spic', 'tard',
    'tits', 'twat', 'wank'
  ];

  let ticketId = '';
  for (let i = 0; i < 4; i += 1) {
    ticketId += alphabet[_.random(alphabet.length - 1)];
  }

  if (swearWords.indexOf(ticketId.toLowerCase()) > -1) {
    return generateTicketId();
  }

  return ticketId;
}

function sendEmail(req, res) {
  const phone    = req.body.phone || 'not given';
  const referrer = req.get('Referrer') || 'could not be determined';

  const message = {};
  message.text = [
    req.body.message,
    '\n----------\n',
    'Email: ' + req.body.email,
    'Phone: ' + phone,
    'Requested From: ' + referrer
  ].join('\n');
  message.html = entities.encode(message.text).replace(/\n/g, '<br/>\n');

  let recipient = config.contact[req.body.inquiry] || config.contact['default'];

  // let ticketId = Date.now().toString(36);
  // let name     = req.body.email.split('@')[0].replace(/\./g, ' ').replace(/^(.)|\s+(.)/g, ($1) => $1.toUpperCase());
  // let subject  = `(${ticketId}) (${name}) ${req.body.subject || 'Nutritionix Help'}`;


  let ticketId = generateTicketId();
  let subject = `${req.body.subject || 'Nutritionix Help'} (${ticketId})`;


  const params = {
    Destination:      {
      ToAddresses: [
        recipient
      ]
    },
    Message:          {
      Body:    {
        Html: {
          Data:    message.html,
          Charset: 'utf8'
        },
        Text: {
          Data:    message.text,
          Charset: 'utf8'
        }
      },
      Subject: {
        Data:    subject,
        Charset: 'utf8'
      }
    },
    Source:           req.body.email + '<' + req.body.email.replace('@', '_') + '@nutritionix.com>',
    ReplyToAddresses: [req.body.email]
  };

  knex(config.nix_database + '.nix_mails')
    .insert({
      name:        req.body.name || req.body.email.split('@')[0].replace(/[._]+/, ' '),
      email:       req.body.email,
      body:        JSON.stringify(message),
      datecreated: knex.raw('NOW()'),
      type:        100,
      ip_address:  req.connection.remoteAddress
    })
    .then(function () {
      logger.log('email data backup record created');
    })
    .catch(function (error) {
      logger.error('email data backup record not created: ', error);
    });

  ses.sendEmail(params, function (error, result) {
      if (error) {
        res.status(500).send(error)
      } else {
        res.status(200).send(result);
      }
    }
  );
}

function shareFoodLog(req, res, next) {
  request({
    method:  'GET',
    url:     'https://trackapi.nutritionix.com/v2/me',
    headers: {
      'x-3scale-bypass': 'c49e69471a7b51beb2bb0e452ef53867385f7a5a',
      'x-user-jwt':      req.headers['x-user-jwt']
    },
    json:    true
  })
    .then(function (me) {
      return request({
        method:  'GET',
        url:     'https://trackapi.nutritionix.com/v2/log',
        headers: {
          'x-3scale-bypass': 'c49e69471a7b51beb2bb0e452ef53867385f7a5a',
          'x-user-jwt':      req.headers['x-user-jwt']
        },
        qs:      {
          timezone: req.body.timezone || "US/Eastern",
          begin:    req.body.begin,
          end:      req.body.end,
        },
        json:    true
      })
        .then(function (response) {
          var foods = response.foods;

          var dates            = [],
              nutrientsByDates = {},
              foodsByDates     = {};

          foods.forEach(function (food) {
            var date = moment(food.consumed_at).format('YYYY-MM-DD');

            if (_.isUndefined(nutrientsByDates[date])) {
              nutrientsByDates[date] = {
                208: 0, //calories
                205: 0, //carbs
                203: 0, //protein
                204: 0, //fat
                307: 0 // sodium
              };
            }

            nutrientsByDates[date][208] += food.nf_calories || 0;
            nutrientsByDates[date][205] += food.nf_total_carbohydrate || 0;
            nutrientsByDates[date][203] += food.nf_protein || 0;
            nutrientsByDates[date][204] += food.nf_total_fat || 0;
            nutrientsByDates[date][307] += food.nf_sodium || 0;

            if (!food.full_nutrients) {
              food.full_nutrients = nutritionixApiDataUtilities.buildFullNutrientsArray(food);
            }

            if (!foodsByDates[date]) {
              dates.push(date);
              foodsByDates[date] = [];
            }

            if (!food.photo || !food.photo.thumb) {
              food.photo = {thumb: '//d2eawub7utcl6.cloudfront.net/images/nix-apple-grey.png'};
            }

            foodsByDates[date].push(food);
          });

          var content = shareFoodLog.view({
            moment:           moment,
            name:             'Yurko',
            foods:            foods,
            dates:            dates,
            nutrientsByDates: nutrientsByDates,
            foodsByDates:     foodsByDates,
            user:             me
          });

          if (req.query.preview) {
            res.send(content);
            return;
          }

          var params = {
            Destination:      {
              ToAddresses: [
                req.body.recipient
              ],
              CcAddresses: [
                (me.first_name + ' ' + (me.last_name || '')).trim() + ' <' + me.email + '>'
              ]
            },
            Message:          {
              Body:    {
                Html: {
                  Data:    content,
                  Charset: 'utf8'
                }
              },
              Subject: {
                Data:    (me.first_name + ' ' + (me.last_name || '')).trim() + ' shared food log with you',
                Charset: 'utf8'
              }
            },
            Source:           'Nutritionix Track <no-reply@nutritionix.com>',
            ReplyToAddresses: [me.email]
          };

          return new bluebird(function (resolve, reject) {
            ses.sendEmail(params, function (error, result) {
                if (error) {
                  reject(error)
                } else {
                  resolve(result);
                }
              }
            );
          })
            .then(function () {
              res.json(true);
            })
        })
    })
    .catch(function (error) {
      logger.error(error);
      res.status(500).json({status: 500, message: 'Something went wrong', error: error});
    });
}

shareFoodLog.view = pug.compileFile(__dirname + '/views/share-food-log.pug');

module.exports = emailRouter;
