'use strict';

const logger = require(require('path').join(__rootdirname, 'server', 'logger.js'));

var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs-extra');
var parser = require('ua-parser-js');

const request = require('request-promise');

// var revision = require("nodegit")
//   .Repository
//   .open(__rootdirname)
//   .then(function (repository) {
//     return repository
//       .getBranchCommit("master")
//       .then(function (commit) {
//         return commit.id().toString();
//       });
//   });

var revision = require('promised-exec')('cd {root} && git rev-parse HEAD'.replace('{root}', __rootdirname))
  .then(function (revision) {
    return revision.trim();
  });

router.use(express.static(path.resolve(__dirname, './../../client')));

//redirects
require('./redirects')(router);

router.all('/track-api*?', require('./trackApiProxy'));
router.all('/natural-elb*?', require('./naturalElbProxy'));

router.use('/nixapi', require('./foodRouter.js'));
router.use('/nixapi/customer', require('./customerRouter.js'));
router.use('/nixapi/labs', require('./labsRouter.js'));
router.use('/nixapi/export', require('./exportRouter.js'));
router.use('/labsapi/calories-count', require('./caloriesCountRouter'));
router.use('/email', require('./emailRouter.js'));
router.use('/sms', require('./smsRouter.js'));
router.use('/reports', require('./reportRouter.js'));

router.put('/nixapi/refresh-cache', function (req, res) {
  // recache in prerender
  if (req.body.url.indexOf('https://www.nutritionix.com') === 0) {
    request({
      url:    'http://api.prerender.io/recache',
      method: 'POST',
      json:   true,
      body:   {
        prerenderToken: process.env.PRERENDER_TOKEN,
        url:            req.body.url
      }
    })
      .then(response => {
        console.log(response);
      });
  }

  res.json(true);
});

router.get('/robots.txt', function (req, res) {
  res.type('text/plain');
  res.send("User-agent: *\nDisallow: /");
});
router.get('/healthCheck', function (req, res) {
  res.status(200).json({
    message: 'Everything is 200 ok!'
  });
});

router.get('/version', function (req, res) {
  revision.then(function (hash) {
    res.status(200).json({
      version: hash
    });
  });
});

router.get('/apple-app-site-association', function (req, res) {
  res.json({
    "applinks":       {
      "apps":    [],
      "details": [
        {
          "appID": "com.nutritionix.nixtrack",
          "paths": ["/q1", "/q2", "/q3"]
        }
      ]
    },
    "webcredentials": {
      "apps": [
        "com.nutritionix.nixtrack"
      ]
    }
  });
});

const distDir = path.join(__rootdirname, '/client/nix_dist');

router.get(/^.*\.\w{2,4}$/, function(req, res){
  let distMatch = req.url.match(/^\/nix_dist\/([^_]+)(?:[_\w]+)?(\.\w+)$/);

  if (distMatch) {
    let [, name, ext] = distMatch;

    fs.readdir(distDir, function (err, files) {
      for (let i = 0; i < files.length; i += 1) {
        let pathInfo = path.parse(files[i]);

        if (pathInfo.name.substr(0, name.length) === name && pathInfo.ext === ext) {
          res.sendFile(path.join(distDir, files[i]));
          return;
        }
      }

      res.status(404).end('Requested file does not exist');
    });
  } else {
    res.status(404).end('Requested file does not exist');
  }
});


// your express error handler
router.use(function (err, req, res, next) {
  // in case of specific URIError
  if (err instanceof URIError) {
    err.message = 'Failed to decode param: ' + req.url;
    err.status  = err.statusCode = 404;
  }

  if (err) {
    if (err.status) {
      res.status(err.status);

      if (err.status === 404) {
        return index(req, res);
      }
    } else {
      res.status(500).json({
        message: err.message
      })
    }
  } else {
    next();
  }
});

router.get('*', index);

function index(req, res) {
  var index = path.join(__rootdirname, '/client/nix_dist/layout.html');
  var unsupported = path.join(__rootdirname, '/client/nix_app/unsupported.html');

  var browser = parser(req.headers['user-agent']).browser;

  if(browser.name === 'IE' && browser.major < 9){
    res.sendFile(unsupported);
    return;
  }

  (function send() {
    fs.stat(index, function (error, stats) {
      if (error) {
        logger.log('Waiting for index file');
        setTimeout(send, 500);
      } else {
        res.sendFile(index);
      }
    });
  }());
}

function notFound404(req, res) {
  res.status(404);
  res.sendFile(path.join(__rootdirname, '/client/nix_app/404.html'));
}

module.exports = router;
