'use strict';

const components = require('./init.js');
const config     = components.config;

const Promise = require('bluebird');
const moment  = require('moment');
const _       = require('lodash');
const s3      = components.s3;

const knex = require('knex');

const rds = knex({
  client:     'mysql',
  connection: {
    host:     config.db.hosts.rds_replica,
    user:     config.db.username,
    password: config.db.password,
    port:     config.db.port || 3306,
    timezone: 'UTC'
  }
});

const aurora = knex({
  client:     'mysql',
  connection: {
    host:     config.db.hosts.aurora,
    user:     config.db.username,
    password: config.db.password,
    port:     config.db.port || 3306,
    timezone: 'UTC'
  }
});

const rdsQuery = `
  SELECT SUM(CASE
               WHEN item_type=2
                    AND upc IS NOT NULL
                    AND deleted=0 THEN 1
               ELSE 0
           END) cpg_count,
       SUM(CASE
               WHEN item_type=2
                    AND upc IS NOT NULL
                    AND deleted=0
                    AND front_full_asset_id IS NOT NULL THEN 1
               ELSE 0
           END) cpg_images_count,
       SUM(CASE
               WHEN item_type=1
                    AND deleted=0 THEN 1
               ELSE 0
           END) restaurant_count,
       SUM(CASE
               WHEN item_type=3
                    AND deleted=0 THEN 1
               ELSE 0
           END) usda_count,
       NOW() updated_at,

  (SELECT created_at
   FROM \`nutritionix-api\`.v1_items
   ORDER BY created_at DESC
   LIMIT 1) last_item_added,

  (SELECT count(*) AS restaurant_brands
   FROM \`nutritionix-api\`.v1_brands b
   WHERE b.type=1
     AND deleted=0
     AND
       (SELECT count(*)
        FROM \`nutritionix-api\`.v1_items
        WHERE brand_id=b._id
          AND deleted=0)>1) AS restaurant_brands,

  (SELECT count(*) AS restaurant_brands
   FROM \`nutritionix-api\`.v1_brands b
   WHERE b.type=2
     AND deleted=0
     AND
       (SELECT count(*)
        FROM \`nutritionix-api\`.v1_items
        WHERE brand_id=b._id
          AND deleted=0)>1) AS cpg_brands
  FROM \`nutritionix-api\`.v1_items`;

const bucket = 'nix-export';
const s3Key  = 'item-totals.json';

let totals = {updated_at: moment().utc().format()};

rds.raw(rdsQuery)
  .then(dbResponse => dbResponse[0][0])
  .then(data => _.merge(totals, data))
  .then(() => aurora.count('* as cnt')
    .from('nutritionix-track-2.users')
    .whereNotNull('email'))
  .then(rows => totals.track_total_users = rows[0].cnt)
  .then(() => aurora.count('* as cnt')
    .from('nutritionix-track-2.users')
    .whereRaw("DATE(CONVERT_TZ(created_at,'UTC','US/Eastern'))=DATE(NOW() - INTERVAL 1 DAY)"))
  .then(rows => totals.track_users_added_yesterday = rows[0].cnt)
  .then(() => aurora.count('* as cnt')
    .from('brand_locations.locations')
    .whereRaw("closed <> 1"))
  .then(rows => totals.brand_locations_count = rows[0].cnt)
  .then(() => new Promise((resolve, reject) => {
    s3.putObject({
      Bucket:      bucket, /* required */
      Key:         s3Key, /* required */
      ACL:         'public-read',
      Body:        JSON.stringify(totals),
      ContentType: 'application/json'
    }, (err, data) => err ? reject(err) : resolve(data));
  }))
  .then(() => {
    console.log('Totals: ', totals);
    console.log(`Object URL: https://${bucket}.s3.amazonaws.com/${s3Key}`);
    console.log('finished');
    process.exit()
  })
  .catch(error => {
    console.log(error);
    process.exit(1)
  });
