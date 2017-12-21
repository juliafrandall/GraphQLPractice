'use strict';

const components = require('./init.js');
const config     = components.config;

const Promise = require('bluebird');
const _       = require('lodash');
const request = require('request-promise');
const s3      = components.s3;
const ses     = components.ses;
const parse   = require('csv-parse');
const moment  = require('moment-timezone');

const utils = require('nutritionix-api-data-utilities');

function postToTrackApi(jwt, endpoint, bodyAttribute, records) {
  let body            = {};
  body[bodyAttribute] = records;

  return request({
    method:  'POST',
    url:     'https://trackapi.nutritionix.com/v2' + endpoint,
    headers: {
      'x-user-jwt': jwt
    },
    body,
    json:    true
  })
}
const adapters = {
  foods:     {
    mealTypes:     {
      'Breakfast': 1,
      'Snacks':    2,
      'Lunch':     3,
      'Dinner':    5,
      'Anytime':   7
    },
    endpoint:      '/log',
    bodyAttribute: 'foods',
    convert:       function (rawRecord) {
      const record = _.pickBy(rawRecord, (value, key) => value !== '');

      let mealType = this.mealTypes[record.mealtime] || this.mealTypes['Dinner'];
      let date     = moment
        .tz(
          record.day,
          record.day.indexOf('/') > 0 ? "MM/DD/YYYY" : 'YYYY-MM-DD',
          config.profile.timezone || 'UTC'
        );

      switch (mealType) {
        case 1:
          date.hours(9);
          break;
        case 2:
          date.hours(10);
          break;
        case 3:
          date.hours(12);
          break;
        case 5:
          date.hours(19);
          break;
        default:
          date.hours(21);
          break;
      }

      let food = {
        food_name:             record.description,
        serving_qty:           1,
        source:                9,
        serving_unit:          'serving',
        serving_weight_grams:  record.grams,
        nf_calories:           record.calories,
        nf_total_fat:          record.fat,
        nf_saturated_fat:      record.fat_saturated,
        nf_cholesterol:        record.cholesterol,
        nf_sodium:             record.sodium,
        nf_total_carbohydrate: record.carbs,
        nf_dietary_fiber:      record.fiber,
        nf_sugars:             record.sugars,
        nf_protein:            record.protein,
        nf_potassium:          record.potassium,
        nf_p:                  record.phosphorus,
        full_nutrients:        [
          {attr_id: 605, value: record.fat_trans},
          {attr_id: 221, value: record.alcohol},
          {attr_id: 301, value: record.calcium},
          {attr_id: 303, value: record.iron},
          {attr_id: 315, value: record.manganese},
          {attr_id: 406, value: record.niacin},
          {attr_id: 410, value: record.panto_acid},
          {attr_id: 405, value: record.riboflavin},
          {attr_id: 317, value: record.selenium},
          {attr_id: 404, value: record.thiamin},
          {attr_id: 318, value: record.vit_a},
          {attr_id: 415, value: record.vit_b6},
          {attr_id: 418, value: record.vit_b12},
          {attr_id: 401, value: record.vit_c},
          {attr_id: 324, value: record.vit_d},
          {attr_id: 323, value: record.vit_e},
          {attr_id: 309, value: record.zinc},

        ],
        consumed_at:           date.format(),
        metadata:              {calories_count_food: rawRecord}
      };

      _.forEach(food, (value, key) => {
        if (_.isUndefined(value)) {
          food[key] = null;
        } else if (key.substr(0, 3) === 'nf_' || key === 'serving_weight_grams') {
          food[key] = parseFloat(value);
        }
      });

      food.full_nutrients = food.full_nutrients.filter(nutrient => !_.isUndefined(nutrient.value));
      food.full_nutrients.forEach(nutrient => {
        nutrient.value = parseFloat(nutrient.value);
      });

      food.full_nutrients = food.full_nutrients.concat(
        utils.buildFullNutrientsArray(food)
          .map(nutrient => _.pick(nutrient, ['attr_id', 'value']))
      );

      return food;
    }
  },
  weightIns: {
    endpoint:      '/weight/log',
    bodyAttribute: 'weights',
    convert:       function (record, options) {
      return {
        timestamp: moment
                     .tz(
                       record.day,
                       record.day.indexOf('/') > 0 ? "MM/DD/YYYY" : 'YYYY-MM-DD',
                       config.profile.timezone || 'UTC'
                     )
                     .format(),
        kg:        options && options.units === 'kg' ? record.weight : record.weight * 0.45359237
      }
    }
  }
};
function sendSuccessEmail(profile) {
  if (!profile.email || profile.email.indexOf('@') === -1) { return;}

  let text = `Hi ${profile.first_name},\n\n` +
    'We successfully completed the import of your CalorieCount data. ' +
    'You can view it at www.nutritionix.com/dashboard or in our mobile app at http://www.nutritionix.com/app.\n\n' +
    'Warm regards,\nNutritionix Team';


  const params = {
    Destination: {
      ToAddresses: [
        `"${(profile.first_name + ' ' + profile.last_name).trim()}" <${profile.email}>`
      ]
    },
    Message:     {
      Body:    {
        Text: {
          Data:    text,
          Charset: 'utf8'
        }
      },
      Subject: {
        Data:    'Nutritionix has successfully imported your CalorieCount data',
        Charset: 'utf8'
      }
    },
    Source:      '"Nutritionix" <no-reply@nutritionix.com>',
  };

  return new Promise((resolve, reject) => {
    ses.sendEmail(params, function (error, result) {
        if (error) {
          reject(error)
        } else {
          resolve(result);
        }
      }
    );
  });

}

new Promise(function (resolve, reject) {
  console.log(`Downloading file s3://${config.file.Bucket}/${config.file.Key}`);
  s3.getObject(components.config.file)
    .createReadStream()
    .pipe(parse({columns: true}, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    }));

})
  .then(data => {
    console.log(`File contains ${data.length} records`);
    let adapter = adapters[config.type];

    return Promise.map(
      _.chunk(data, 50),
      records => postToTrackApi(
        config['x-user-jwt'], adapter.endpoint, adapter.bodyAttribute,
        records.map(record => adapter.convert(record, config.options))
      ),
      {concurrency: 1}
    );
  })
  .then(response => {
    console.log(`Sending success email to ${config.profile.email}`);
    return sendSuccessEmail(config.profile, config.type);
  })
  .then(() => {
    return new Promise((resolve, reject) => {
      let parts = config.file.Key.split('/');
      parts.splice(-1, 0, 'processed');
      let key = parts.join('/');

      console.log(
        `Moving s3://${config.file.Bucket}/${config.file.Key} -> ` +
        `s3://${config.file.Bucket}/${key}`
      );


      s3.copyObject({
        Bucket:     config.file.Bucket,
        CopySource: `${config.file.Bucket}/${config.file.Key}`,
        Key:        parts.join('/'),
      }, (err, data) => {
        if (err) { return reject(err);}

        s3.deleteObject(config.file, function (err, data) {
          if (err) { return reject(err);}
          resolve(data);
        });
      })
    });
  })
  .then(() => {
    console.log('Done');
  })
  .catch(error => {
    console.error(error);
    process.exit(1)
  });
