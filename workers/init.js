'use strict';

const _    = require('lodash');
const fs   = require('fs');
const YAML = require('yamljs');
const AWS  = require('aws-sdk');

function readConfigFile(path) {
  let configuration = {};

  try {
    configuration = fs.readFileSync(path).toString();
    configuration = (['{', '['].indexOf(configuration[0]) > -1 ? JSON : YAML).parse(configuration);
  } catch (e) {
    console.error('Configuration file could not been read:: ', e.message);
  }

  return configuration;
}

let payload = {}, config = {};

if (process.env.CONFIG_FILE) { config = readConfigFile(process.env.CONFIG_FILE); }
if (process.env.PAYLOAD_FILE) { payload = readConfigFile(process.env.PAYLOAD_FILE); }

exports.config = config = _.merge(config, payload);

AWS.config.update(_.merge({region: 'us-east-1'}, config.AWS));

exports.s3  = new (require('aws-sdk')).S3();
exports.ses = new (require('aws-sdk')).SES();
