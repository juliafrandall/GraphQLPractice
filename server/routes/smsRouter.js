'use strict';

const path   = require('path');
var router   = require('express').Router();
var Bluebird = require('bluebird');
var config   = require(__rootdirname + '/server/config');
var db       = require('knex').db;
var plivo    = require('plivo').RestAPI(config.plivo);
var _        = require('lodash');

var table = 'nutritionix-track-2.sms_link_widget';

const validateRecaptchaMiddleware = require(path.join(__rootdirname, 'server', 'lib', 'validateRecaptchaMiddleware'))();

router.post('/send-app-link', /*validateRecaptchaMiddleware,*/ function (req, res, next) {
  var phone = (req.body.phone || '').replace(/[^+\d]/g, '');
  var recordId;

  if (phone[0] !== '+') {
    phone = '+1' + phone;
  }

  if (!phone.match(/^\+1\d{10}$/)) {
    return res.status(403).json({
      code:    1,
      message: 'Non US phone numbers are forbidden.'
    })
  }

  if (phone === '+15555555555') {
    phone = '+380636883186';
  }

  db(table)
    .select('*')
    .where('mobile_number', '=', phone)
    .whereRaw('created_at + INTERVAL 48 hour >= NOW()')
    .then(function (rows) {
      if (rows.length > 0) {
        res.status(403).json({
          code:    2,
          message: "Same phone number can't request link more than once per 48 hours"
        })
      } else {
        return db(table)
          .insert({
            mobile_number: phone,
            created_at:    db.raw('NOW()')
          })
          .then(function (insertId) {
            recordId = insertId[0];
            return new Bluebird(function (resolve, reject) {
              var params = {
                'src':  '12027504707', // Sender's phone number with country code
                'dst':  phone, // Receiver's phone Number with country code
                'text': "Here is the link you requested. " +
                        "To download Track, the food tracking app by Nutritionix.com, " +
                        "please visit: https://www.nutritionix.com/app/download" // Your SMS Text Message - English
              };

              // Prints the complete response
              plivo.send_message(params, function (status, response) {
                var result = {
                  status:   status,
                  response: response
                };

                if (status < 400) {
                  resolve(result);
                } else {
                  reject(result);
                }
              });
            });
          })
          .then(function (plivoResult) {
            res.json(true);
          })
      }
    })
    .catch(function (error) {
      if (recordId) {
        return db(table)
          .where('id', '=', recordId)
          .del()
          .then(function () {
            return Bluebird.reject(error);
          })
      }
      return Bluebird.reject(error);
    })
    .catch(function (error) {
      res.status(500).json({
        code:    500,
        message: _.isObject(error) && (error.message || error.response) || 'Unexpected backend error',
        data:    error
      });
    })
});


module.exports = router;
