var _ = require('lodash');
var config = require('./main.js');
var fs = require('fs');

var envConfigFile = __dirname + '/' + process.env.NODE_ENV + '.js';

if (fs.existsSync(envConfigFile)) {
  _.merge(config, require(envConfigFile));
}

module.exports = config;

