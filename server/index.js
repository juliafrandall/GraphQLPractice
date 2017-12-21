global.__rootdirname = require('path').resolve(__dirname, '..');

const logger = require(require('path').join(__rootdirname, 'server', 'logger.js'));

process.env.NODE_ENV  = process.env.NODE_ENV || 'development';
var config            = require('./config');
var knex              = require('knex');
var redis             = require('redis');
var expressRedisCache = require('express-redis-cache');
var _                 = require('lodash');
const Promise         = require('bluebird');


redis.client = redis.createClient({
  host: config.redis.host,
  port: config.redis.port || 6379,
  db:   config.redis.database
});

redis.client.on('error', error => {
  logger.error('Redis Cache failed: ' + error.message);
});

expressRedisCache.instance = expressRedisCache({
  client: redis.client,
  expire: {
    200:   30 * 24 * 3600,
    '4xx': 10,
    403:   5000,
    '5xx': 10,
    'xxx': 1
  }
});

expressRedisCache.instance.on('error', error => {
  logger.error('Express Redis Cache failed: ' + error.message);
});

expressRedisCache.instance.createExpire = function (settings) {
  let expire = _.clone(this.expire);
  if (_.isObject(settings) && !_.isFunction(settings)) {
    _.merge(expire, settings);
  } else {
    _.merge(expire, {200: settings});
  }

  _.forEach(expire, (expiration, status) => {
    if (_.isFunction(expiration)) {
      delete expire[status];

      Object.defineProperty(expire, status, {
        enumerable:   true,
        configurable: false,
        get:          expiration,
        set:          () => {}
      });
    }
  });

  return expire;
};

knex.db = knex({
  client:     'mysql',
  connection: {
    host:     config.mysql.host,
    user:     config.mysql.user,
    password: config.mysql.password,
    database: 'nutritionix-api',
    timezone: "UTC"
  }
});

if (config.aurora.host) {
  knex.aurora = knex({
    client:     'mysql',
    connection: {
      host:     config.aurora.host,
      user:     config.aurora.user,
      password: config.aurora.password,
      database: 'nutritionix-track-2',
      timezone: "UTC"
    }
  });
}

// knex.replica = knex({
//   client:     'mysql',
//   connection: {
//     host:     config.mysql.replica_host,
//     user:     config.mysql.user,
//     password: config.mysql.password,
//     database: 'nutritionix-api',
//     timezone: "UTC"
//   }
// });

var AWS = require('aws-sdk');
AWS.config.update({
  accessKeyId:     config.aws.aws_access_key_id,
  secretAccessKey: config.aws.aws_secret_access_key,
  region:          'us-east-1'
});

const nonAmbiguousLowerCase = 'abcdefghjkmnopqrstwxyz';
const nonAmbiguousUpperCase = _.upperCase(nonAmbiguousLowerCase);
const nonAmbiguousNumbers   = '023456789';

const Hashids        = require('hashids');
Hashids.instance     = new Hashids(config.hashids.secret, 15);
Hashids.publicEntity = new Hashids(
  config.hashids.secret, 6,
  `${nonAmbiguousLowerCase}${nonAmbiguousUpperCase}${nonAmbiguousNumbers}`
);

JSON.safeParse = function (data) {
  if (_.isString(data)) {
    try {
      return JSON.parse(data);
    } catch (e) {}
  }

  return data;
};

var express = require('express');
const multer     = require('multer');
multer.upload    = multer({dest: '/tmp/nutritionix.com-uploads/'});
var app = express();
var morgan = require('morgan');
var router = require('./routes/router.js');
var compression = require('compression');
var bodyParser = require('body-parser');


require('./prerender.js')(app);

app.enable('trust proxy');

app.use(function (req, res, next) {
  const data = [];

  req.rawBodyPromise = new Promise(resolve => {
    req.on('data', function (chunk) {
      data.push(chunk);
    });
    req.on('end', function () {
      resolve(Buffer.concat(data));
    });
  });

  next();
});
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(require('cookie-parser')());
app.use(bodyParser.json({
  limit: '500kb',
  inflate: true
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(compression());
app.use(morgan('combined'));

// routes
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
  return next();
});
app.use(router);

app.listen(config.ports.http, function () {
  logger.log('listening on ' + config.ports.http);
});


module.exports = app;
