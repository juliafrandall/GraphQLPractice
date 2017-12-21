'use strict';

const logger = require(require('path').join(__rootdirname, 'server', 'logger.js'));

var prerender = require('prerender-node');
prerender.host = process.env.PRERENDER_SITE_HOST;
prerender.protocol = 'https';

prerender.crawlerUserAgents.push('bingbot');
prerender.crawlerUserAgents.push('yahoo');

var redis;
var cacheableStatusCodes = {200: true, 301: true, 302: true, 404: true};

if (process.env.PRERENDER_ENABLE && process.env.PRERENDER_REDIS_HOST) {
  redis = require('redis').createClient({
    host: process.env.PRERENDER_REDIS_HOST,
    port: process.env.PRERENDER_REDIS_PORT || 6379
  });

  redis.on("error", function (err) {
    logger.error("Redis Error: " + err);
  });

  redis.on("ready", function () {
    redis.select(process.env.PRERENDER_REDIS_DATABASE || 0, function () {
      prerender.set('beforeRender', function (req, done) {
        redis.hmget(req.url, 'body', 'status', function (err, fields) {
          if (err) {
            return done(err);
          }

          if (fields[0] === null) {
            return done();
          }

          done(err, {body: fields[0], status: fields[1]});
        });
      }).set('afterRender', function (err, req, prerender_res) {
        // Don't cache responses that might be temporary like 500 or 504.
        if (cacheableStatusCodes[prerender_res.statusCode]) {
          redis.hmset(req.url, 'body', prerender_res.body, 'status', prerender_res.statusCode, function () {
            var expiration = process.env.PRERENDER_REDIS_EXPIRE || 86400; // defaults to one day
            redis.expire(req.url, expiration);
          });
        }
      });
    });
  });
}

module.exports = function (app) {
  if (process.env.PRERENDER_ENABLE) {
    app.use(prerender);
  }
};
