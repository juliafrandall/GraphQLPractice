'use strict';

const router   = require('express').Router();
const bluebird = require('bluebird');
const db       = require('knex').db;
const _        = require('lodash');
const fs = require('fs-extra');

const s3 = new (require('aws-sdk')).S3();

const bucket = 'nixdotcom';
const prefix = 'calories-count-import';

const iworker = new (require('iron_worker')).Client({
  "project_id": "558d071772e89f00060000ac",
  "token":      "kAWt5rsh14-vpUGddvVCp8QpOyc"
});

router.post('/import', require('multer').upload.single('file'), function (req, res, next) {
  let id = req.body.profile.email && req.body.profile.email.indexOf('@') > -1 ? req.body.profile.email : req.body.profile.id;
  let key = `${prefix}/${id}_${Date.now()}_${req.body.type}.csv`;

  s3.putObject({
    Bucket: bucket,
    Key:    key,
    ACL:    'private',
    Body:   fs.createReadStream(req.file.path)
  }, function (err) {
    if (err) {
      return res.status(500).json({error: err.message});
    }

    let task = req.body;
    task.file = {
      Bucket: bucket,
      Key:    key
    };

    iworker.tasksCreate(
      'calorie-count-import',
      task,
      {cluster: 'nutritionix'},
      function (error, body) {
        if (error) {
          res.status(500).json({error: error.message});
        } else {
          res.json(body);
        }
      }
    );
  });
});


module.exports = router;
