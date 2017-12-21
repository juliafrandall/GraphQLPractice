'use strict';

const knex        = require('knex').db;
const querystring = require('querystring');
const _           = require('lodash');
const parser      = require('ua-parser-js');
const request     = require('request-promise');
const Promise     = require('bluebird');

function cleanurl(string) {
  return _.trim(string || '')
    .replace(/(\d+\/\d+)/, simpleFraction => {
      let [nominator, denominator] = simpleFraction.split('/');
      return _.round(nominator / denominator, 2)
    })
    .replace(/[^.\w'+]/g, '-')
    .replace(/([^\d]\.|\.[^\d])/g, s => s.replace('.', '-'))
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/-+/g, '-')
    .replace(/-+$/, '')
    .replace(/^-+/, '');
}

module.exports = function(router){
  // remove trailing slashes from url
  router.use(function (req, res, next) {
    if (req.method === 'GET' && req.path !== '/i/' && req.path.length > 1 && req.path[req.path.length - 1] === '/') {
      res.redirect(
        301,
        req.originalUrl
          .replace('/?', '?')
          .replace(/\/$/, '')
      );
    } else {
      next();
    }
  });

  router.get('/app/download', function (req, res) {
    var browser = parser(req.headers['user-agent']);

    if (browser.os.name === 'Android') {
      return res.redirect(302, 'https://play.google.com/store/apps/details?id=com.nutritionix.nixtrack&hl=en');
    }

    if (browser.os.name === 'iOS' && browser.device.type === 'mobile' || ['iPhone', 'iPod'].indexOf(browser.device.model) > -1) {
      return res.redirect(302, 'https://itunes.apple.com/us/app/track-food-tracker-by-nutritionix/id1061691342?ls=1&mt=8');
    }

    res.redirect(302, '/app');
  });

  router.get('/profile', function (req, res) {
    res.redirect(301, '/account');
  });

  router.get('/labs/locate-test', function (req, res) {
    let query = querystring.stringify(req.query);
    if (query) {
      query = '?' + query;
    }

    res.redirect(301, '/restaurant-map' + query.replace(/%3A/g, ':'));
  });

  router.get('/account/dashboard', function (req, res) {
    res.redirect(301, '/dashboard');
  });

  router.get('/account/login', function (req, res) {
    res.redirect(301, '/login');
  });

  router.get('/account/create/step1', function (req, res) {
    res.redirect(301, '/account/create');
  });

  router.get('/search/item/:id', function (req, res) {
    res.redirect(301, '/go/i/' + req.params.id);
  });

  router.get('/brand/:brand_slug/products/:brand_id/:page', function (req, res) {
    var url = ['brand', req.params.brand_slug, 'products', req.params.brand_id].join('/');
    var query = req.query;
    query.page = req.params.page;
    res.redirect(301, '/' + url + '?' + querystring.stringify(query));
  });

  router.get('/brands/:type/:page', function (req, res) {
    var url = ['brands', req.params.type].join('/');
    var query = req.query;
    query.page = req.params.page;
    res.redirect(301, '/' + url + '?' + querystring.stringify(query));
  });

  router.get('/nix_labs/twitterLog', function (req, res) {
    res.redirect(301, '/labs/twitter-analyzer');
  });
  router.get('/search/:q', function (req, res) {
    var url = '/search?q=' + req.params.q;
    if (req.query.page) {
      url += '&page=' + req.query.page;
    }
    res.redirect(301, url);
  });
  router.get(/search\/$/, function (req, res) {
    var query = querystring.stringify(req.query);
    if (query) {
      query = '?' + query;
    }
    res.redirect(301, '/search' + query);
  });
  router.get('/search', function (req, res, next) {
    if (!req.query.q) {
      res.status(404);
    } else if (req.query.p) {
      req.query.page = req.query.p;
      delete req.query.p;
      res.redirect(301, '/search?' + querystring.stringify(req.query));
      return;
    }

    next()
  });
  router.get(/^\/i\/\/\/$/i, function (req, res) {
    res.redirect(301, '/');
  });
  router.get('/go/:redirectType/:item_id', function (req, res, next) {
    var info;

    switch (req.params.redirectType) {
    case 'i':
      info = knex.raw('call item_lookup(?)', [req.params.item_id])
        .then(function (response) {
          return response[0][0][0];
        });
      break;
    case 'usda':
      info = knex
        .select(['i._id as item_id', 'i.item_name', 'b.name as brand_name'])
        .from('nutritionix-api.v1_items as i')
        .join('nutritionix-api.v1_brands as b', 'i.brand_id', '=', 'b._id')
        .where({
          'item_type':     3,
          'i.deleted':     0,
          'remote_db_key': req.params.item_id
        })
        .whereRaw('i.`seq` IS NOT NULL')
        .orderBy('seq', 'ASC')
        .limit(1)
        .then(function (rows) {
          return rows[0];
        });
      break;
    default:
      return next();
      break;
    }

    info
      .then(function (urlParams) {
        var url;

        if (!urlParams) {
          res.status(404);
          return next();
        }

        // /i/:brand/:item_name/:item_id
        url = [
          '/i',
          cleanurl(urlParams.brand_name),
          cleanurl(urlParams.item_name),
          urlParams.item_id
        ].join('/');

        res.redirect(301, url);
      })
      .catch(next);
  });

  router.get('/i/:brand/:item_name/:item_id', function (req, res, next) {
    knex.raw('call item_lookup(?)', [req.params.item_id])
      .then(function (response) {
        return response[0][0][0];
      })
      .then(function (item) {
        var url;

        if (!item) {
          res.status(404);
          return next();
        }

        // /i/:brand/:item_name/:item_id
        url = [
          '/i',
          cleanurl(item.brand_name),
          cleanurl(item.item_name),
          item.item_id
        ].join('/');

        if (url === req.originalUrl.replace('?developer=1', '')) {
          return next();
        }

        res.redirect(301, url);
      })
      .catch(next);
  });

  router.get('/brand/:brand_name/products/:id', function (req, res, next) {
    var query = querystring.stringify(req.query);
    if(query){
      query = '?' + query;
    }

    knex.select('*')
      .from('nutritionix-api.v1_brands')
      .where('_id', '=', req.params.id)
      .then(function (rows) {
        return rows[0];
      })
      .then(function (brand) {
        var url;

        if (!brand) {
          res.status(404);
          return next();
        }

        // /brand/:brand_name/products/:id
        url = [
          '/brand',
          cleanurl(brand.name),
          'products',
          brand._id
        ].join('/') + query;

        if (url === req.originalUrl) {
          return next();
        }

        res.redirect(301, url);
      })
      .catch(next);
  });

  router.get(['/recipe/:recipe_name/:id', '/recipe//:id'], function (req, res, next) {
    let query = querystring.stringify(req.query);
    if (query) {
      query = '?' + query;
    }

    return request({
      method:  'GET',
      url:     `https://trackapi.nutritionix.com/v2/recipe/${req.params.id}`,
      headers: {
        'x-3scale-bypass': 'c49e69471a7b51beb2bb0e452ef53867385f7a5a'
      },
      json:    true
    })
      .then(function (response) {
        let url;

        if (!response.id) {
          return Promise.reject({statusCode: 404});
        }

        let recipe = response;

        url = [
            '/recipe',
            cleanurl(recipe.name),
            recipe.public_id
          ].join('/') + query;

        if (url === req.originalUrl) {
          return next();
        }

        res.redirect(301, url);
      })
      .catch(function (error) {
        if (error.statusCode === 401 || error.statusCode === 404) {
          res.status(404);
          next();
        } else {
          next(error);
        }
      });
  });

  router.get('/list/:list_name/:id', function (req, res, next) {
    let query = querystring.stringify(req.query);
    if (query) {
      query = '?' + query;
    }

    return request({
      method:  'GET',
      url:     `https://trackapi.nutritionix.com/v2/public_lists/${req.params.id}`,
      headers: {
        'x-3scale-bypass': 'c49e69471a7b51beb2bb0e452ef53867385f7a5a'
      },
      json:    true
    })
      .then(function (response) {
        let url;

        if (!response.id) {
          return Promise.reject({statusCode: 404});
        }

        let list = response;

        url = [
          '/list',
          cleanurl(list.name),
          list.id
        ].join('/') + query;

        if (url === req.originalUrl) {
          return next();
        }

        res.redirect(301, url);
      })
      .catch(function(error){
        if(error.statusCode === 401 || error.statusCode === 404){
          res.status(404);
          next();
        } else {
          next(error);
        }
      });
  });
};
