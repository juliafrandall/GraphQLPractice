'use strict';

const logger = require(require('path').join(__rootdirname, 'server', 'logger.js'));

var foodRouter = require('express').Router();
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var config = require('../config');
var qs = require('querystring');
var knex = require('knex').db;
var aurora = require('knex').aurora;
var urlencode = require('urlencode');
var _ = require('lodash');

var expressCache = require('express-redis-cache').instance;
const hashids    = require('hashids');

/*******
 /GET
 *******/

foodRouter.get('/database/recently-added-products', recentlyAddedProducts);
foodRouter.get('/getTagByNdb/:ndb', expressCache.route(), getTagByNdb);
foodRouter.get('/items/:id',
  expressCache.route({expire: expressCache.createExpire(() => _.round(90 * 24 * 3600 * _.random(1, 1.2)))}),
  getItemById
);
foodRouter.get('/v1Items/:id', expressCache.route(), v1Item);
foodRouter.get('/ndb/:id', expressCache.route(), getNdbNoInfo);
foodRouter.get('/brands/:id', expressCache.route(), getBrandById);
foodRouter.get('/brands/:id/items/:page', expressCache.route({expire: expressCache.createExpire(24 * 3600)}), brandItems);
foodRouter.get('/calculators', expressCache.route(), getCalculators);
foodRouter.get('/categories', expressCache.route({expire: expressCache.createExpire(24 * 3600)}), getCategories);
foodRouter.get('/search', search);
foodRouter.get('/public_lists', publicLists);
foodRouter.post('/search', advancedSearch);

/*******
 /FUNCTIONS
 *******/

function publicLists(req, res, next) {
  aurora
    .select([
      'l.id', 'l.name', 'l.photo', 'l.user_id',
      'u.first_name as user_first_name', 'u.last_name as user_last_name'
    ])
    .from('nutritionix-track-2.public_lists as l')
    .join('nutritionix-track-2.users as u', 'l.user_id', 'u.id')
    .where('l.is_published', 1)
    .whereIn('l.user_id', [54, 22183]) // Paige and Janna
    .orderByRaw('IFNULL(l.updated_at, l.created_at) DESC')
    .then(lists => {
      lists.forEach(list => {
        list.id      = hashids.publicEntity.encode(list.id);
        list.user_id = hashids.instance.encode(list.user_id);
        list.items   = JSON.safeParse(list.items);
        list.photo   = JSON.safeParse(list.photo);
      });

      res.json(lists);
    })
    .catch(next);
}

function getTagByNdb(req, res) {
  knex
    .select('id')
    .from('nutritionix-api.tags')
    .where({usda_ndb: req.params.ndb})
    .limit(1)
    .then(function (rows) {
      if (rows.length) {
        res.json(rows[0].id);
      } else {
        res.status(404);
        res.send('tag was not found');
      }
    })
    .catch(function (e) {
      res.status(500);
      res.send('tag could not be loaded');
      logger.log('there was a problem with tag lookup', e);
    });
}

function getNdbNoInfo(req, res) {
  knex
    .select(['i._id as item_id', 'i.item_name', 'b.name as brand_name'])
    .from('nutritionix-api.v1_items as i')
    .join('nutritionix-api.v1_brands as b', 'i.brand_id', '=', 'b._id')
    .where({
      'item_type':     3,
      'i.deleted':     0,
      'remote_db_key': req.params.id
    })
    .whereRaw('i.`seq` IS NOT NULL')
    .orderBy('seq', 'ASC')
    .limit(1)
    .then(function (rows) {
      if (rows.length) {
        res.send(rows[0]);
      } else {
        res.status(404);
        res.send('item was not found');
      }
    })
    .catch(function (e) {
      res.status(500);
      res.send('item could not be loaded');
      logger.log('there was a problem with item lookup', e);
    });

}

function getItemById(req, res) {
  knex.raw('call item_lookup(?)', [req.params.id])
    .then(function (response) {
      return response[0][0][0];
    })
    .then(function (item) {
      // load other sizes items
      if (item && item.item_type === 3) {
        return knex.raw(
          'SELECT i._id AS item_id,i.item_name AS item_name,b.name AS brand_name,\
          i.nf_calories AS calories, i.seq, i.nf_serving_weight_grams as serving_weight, \
          i.nf_serving_size_qty as qty, i.nf_serving_size_unit as measure\
          \
          FROM `nutritionix-api`.v1_items i\
          JOIN `nutritionix-api`.v1_brands b ON b._id=i.brand_id\
          WHERE i.remote_db_id=3 AND i.remote_db_key=? AND i._id != ? AND i.deleted=0',
          [item.remote_db_key, item.item_id])
          .then(function (response) {
            item.sizes = response[0];
            return item;
          })
          .then(function () {
            return knex('nutritionix-api.tags')
              .select(['id as tag_id','image as tag_image', 'name as tag_name'])
              .where('usda_ndb', '=', item.remote_db_key)
          })
          .then(function (rows) {
            if (rows.length) {
              _.extend(item, rows[0]);
            }
            return item;
          })
      }

      return item;
    })
    .then(function (item) {
      // load related items
      if (item) {
        return knex.raw(
          'SELECT _id AS item_id,item_name,nf_calories \
          FROM `nutritionix-api`.v1_items\
          WHERE _id != ?\
          AND brand_id=?\
          AND deleted=0\
          AND MATCH(item_name)\
          AGAINST (? IN NATURAL LANGUAGE MODE)\
          LIMIT 5;',
          [item.item_id, item.brand_id, item.item_name])
          .then(function (response) {
            item.related = response[0];
            return item;
          })
      }

      return item;
    })
    .then(function (item) {
      var brandsFilter, itemsFilter;
      // load related items
      if (item && item.item_type === 1 && false) {
        brandsFilter = [item.brand_id];
        itemsFilter = [item.item_id];

        item.related_from_other_restaurants = [];

        var fetcher = function () {
          return knex
            .select(['i._id AS item_id', 'i.item_name', 'i.nf_calories', 'b.name as brand_name', 'b._id as brand_id'])
            .from('nutritionix-api.v1_items as i')
            .join('nutritionix-api.v1_brands as b', 'i.brand_id', '=', 'b._id')
            .whereNotIn('i._id', itemsFilter)
            .whereNotIn('i.brand_id', brandsFilter)
            .where('i.deleted', '=', '0')
            .where('i.item_type', '=', '1')
            .whereRaw('MATCH(i.item_name) AGAINST (? IN NATURAL LANGUAGE MODE)', [item.item_name])
            .limit(1)
            .then(function (rows) {
              var related = rows[0];
              if (related) {
                itemsFilter.push(related.item_id);
                brandsFilter.push(related.brand_id);
                item.related_from_other_restaurants.push(related);

                if (item.related_from_other_restaurants.length < 5) {
                  return fetcher();
                }
              } else if (brandsFilter.length > 1 && item.related_from_other_restaurants.length < 5) {
                brandsFilter = [item.brand_id];
                return fetcher();
              }
            });
        };

        return fetcher()
          .then(function () {
            return item;
          });
      }

      return item;
    })
    .then(function (item) {
      // load recipe and it's ingredients
      if (item && item.remote_db_id === 3 && item.remote_db_key > 999999) {
        return knex
          .from('hive2.recipes as r')
          .join('hive2.users as u', 'r.published_by', '=', 'u.id')
          .select([
            knex.raw('TRIM(CONCAT(IFNULL(u.given_name, ""), " ", IFNULL(u.family_name, ""))) as published_by'),
            'r.published_at', 'r.modified_at', 'r.total_weight'
          ])
          .where({'r.id': item.remote_db_key})
          .then(function (recipe) {
            item.recipe = recipe[0];

            // we do not want to show unpublished changes
            if(item.recipe.modified_at > item.recipe.published_at){
              item.recipe = null;
            }

            if(item.recipe){
              return knex('hive2.recipe_ingredients')
                .select(['serving_qty', 'serving_unit', 'food', 'calories', 'serving_weight', 'ndb_number'])
                .where({recipe_id: item.remote_db_key})
                .orderBy('id', 'asc')
                .then(function (ingredients) {
                  item.recipe.ingredients = ingredients;
                  return item;
                })
            }

            return item;
          });
      }
      return item;
    })
    .then(function (item) {
      if (item) {
        res.send(item);
      } else {
        res.status(404);
        res.send('item was not found');
      }
    })
    .catch(function (e) {
      res.status(500);
      res.send('item could not be loaded');
      logger.log('there was a problem with item lookup', e, e.stack);
    });
}

function getBrandById(req, res) {
  knex.select(['b.*', 'u.public_name as dietitian_name', 'u.photo as dietitian_photo', 'a.secure_url as logo'])
    .from('nutritionix-api.v1_brands as b')
    .leftJoin('hive2.users as u', 'b.guide_updated_by', '=', 'u.id')
    .leftJoin('nutritionix-api.assets as a', 'b.logo_asset_id', '=', 'a.api_id')
    .where({
      'b._id':     req.params.id,
      'b.deleted': 0
    })
    .then(function (rows) {
      var brand;
      if (rows.length) {
        brand = rows[0];
        return aurora
          .select([knex.raw('count(*) AS ct'), 'nix_item_id', 'food_name', 'nf_calories'])
          .from('nutritionix-track-2.users_food_logs')
          .where('nix_brand_id', '=', req.params.id)
          .whereNotNull('nix_item_id')
          .groupBy('nix_item_id')
          .orderBy('ct', 'desc')
          .limit(10)
          .then(function (popularTrackItems) {
            if (!popularTrackItems.length) {
              return popularTrackItems;
            }

            return knex.select(['_id', 'nf_calories'])
              .from('nutritionix-api.v1_items')
              .whereIn('_id', popularTrackItems.map(i => i.nix_item_id))
              .then(caloriesInfo => {
                popularTrackItems.forEach(i => {
                  i.nf_calories = (_.find(caloriesInfo, {_id: i.nix_item_id}) || i).nf_calories;
                });

                return popularTrackItems;
              });
          })
          .then(function (popularTrackItems) {
            brand.popularTrackItems = popularTrackItems;
            res.send(brand);
          });
      } else {
        res.status(404);
        res.send('brand was not found');
      }
    })
    .catch(function (e) {
      res.status(500);
      res.send('brand could not be loaded');
      logger.log('there was a problem with brand lookup', e);
    });
}

function brandItems(req, res) {
  var brand_id = req.params.id;
  var limit = +(req.query.limit || 20);
  var offset = (req.params.page <= 0 ? 1 : req.params.page - 1) * limit;
  var results = {};
  var search = (req.query.search ? '%' + req.query.search + '%' : '1');

  var sql = 'SELECT _id AS item_id, item_name, nf_calories AS calories, nf_serving_size_qty' +
    ' AS serving_qty, nf_serving_size_unit AS serving_unit FROM `nutritionix-api`.v1_items' +
    ' WHERE deleted = 0 AND brand_id = ? ' + (req.query.search ? 'AND item_name like ?' : 'AND ?') +
    ' GROUP BY item_name' +
    ' ORDER BY item_name ASC,' +
    ' updated_at DESC';

  knex.raw(sql + ' LIMIT ?, ?', [brand_id, search, offset, limit])
    .then(function (items) {
      return results.items = items[0];
    })
    .then(function () {
      return knex.raw('SELECT count(*) as cnt FROM (' + sql + ') t', [brand_id, search])
        .then(function (count) {
          return results.total_hits = count[0][0]['cnt'];
        })
    })
    .then(function () {
      if (results.items.length < 1) {
        results.items.push({
          error: 'no items found'
        });
      }
      res.send(results);
    })
    .catch(function (e) {
      logger.log('there was a problem with brand items', e);
      res.status(500);
      res.end('unexpected error');
    });
}

function getCategories(req, res) {
  knex.raw('SELECT' +
    ' L1.id AS child_id, ' +
    ' L2.id AS parent_id,' +
    ' L1.name AS child_name,' +
    ' L2.name AS parent_name,' +
    ' COALESCE(CONCAT(L2.name," > ",L1.name),L1.name) as tag_name,' +
    ' (SELECT count(*) FROM `nutritionix-api`.item_tags it' +
    ' WHERE it.tagId=L1.id) AS total' +
    ' FROM `nutritionix-api`.tags L1' +
    ' LEFT JOIN tags L2 on L1.parent_id = L2.id ' +
    ' LEFT JOIN tags L3 on L2.parent_id = L3.id' +
    ' WHERE L2.id is not null' +
    ' HAVING total>9 ' +
    ' ORDER BY tag_name ASC;')
    .then(function (response) {
      res.send(response);
    })
    .catch(function (e) {
      logger.log('there was a problem with item lookup', e);
    });
}

function getCalculators(req, res) {
  knex.raw(
      'SELECT _id AS brand_id,name AS brand_name,desktop_calculator_url,mobile_calculator_url,a.secure_url AS logo_url ' +
      'FROM `nutritionix-api`.v1_brands b ' +
      'JOIN assets a ON a.api_id = b.logo_asset_id ' +
      'WHERE b.desktop_calculator_url is not null ' +
      'ORDER BY brand_name ASC '
    )
    .then(function (response) {
      res.send(response[0]);
    })
    .catch(function (e) {
      logger.log('there was a problem with item lookup', e);
    });
}

function search(req, res) {
  var url, page = req.query.page || 1;

  var offset = (page - 1) * 10;
  var upperRange = page * 10;
  var searchQuery = req.query.q;
  var options = {
    fields:  '*',
    results: offset + ':' + upperRange,
    appId:   config.nutritionix_api.id,
    appKey:  config.nutritionix_api.key
  };

  if (req.query.brand_id) {
    options.brand_id = req.query.brand_id;
  }

  options = qs.stringify(options);

  // here I replace simple fraction with decimal because legacy api fails to route the request otherwise.
  searchQuery = searchQuery.replace(/(\d+\/\d+)/g, function(fractionString){
    var fraction = fractionString.split('/');
    return (fraction[0] / (fraction[1] || 1)).toFixed(2);
  });

  searchQuery = searchQuery.replace(/\//g, '');

  url = 'https://api.nutritionix.com/v1_1/search/' + urlencode(searchQuery) + '?' + options;

  request(url, function (error, response, body) {
    if (error) {
      logger.error(error);
      return res.status(500).send('search is broken');
    }

    if (response.statusCode !== 200) {
      res.setHeader('Content-Type', response.headers['content-type']);
      return res.status(response && response.statusCode || 500).send(error || body);
    }

    try {
      var results = JSON.parse(body);
    } catch (e) {
      logger.error(body);
      return res.status(500).send('search is broken');
    }
    var cleanedResults = {
      'total_hits': results.total_hits,
      'hits':       [],
      'upperRange': upperRange,
      'lowerRange': offset + 1
    };

    results.hits.forEach(function (item) {
      cleanedResults.hits.push({
        'item_name':                 item.fields.item_name,
        'item_id':                   item.fields.item_id,
        'brand_name':                item.fields.brand_name,
        'brand_id':                  item.fields.brand_id,
        'calories':                  item.fields.nf_calories,
        'servings':                  item.fields.nf_servings_per_container,
        'serving_quantity':          item.fields.nf_serving_size_qty,
        'serving_size_unit':         item.fields.nf_serving_size_unit,
        'serving_size_weight_grams': item.fields.nf_serving_weight_grams
      })
    });
    res.status(200).send(req.query.full_data ? results : cleanedResults);
  });
}

function v1Item(req, res) {
  var url;

  var options = {
    id:     req.params.id,
    appId:  config.nutritionix_api.id,
    appKey: config.nutritionix_api.key
  };

  options = qs.stringify(options);

  url = 'https://api.nutritionix.com/v1_1/item' + '?' + options;

  request(url, function (error, response, body) {
    if (error) {
      logger.error(error);
      return res.status(500).send('search is broken');
    }

    if (response.statusCode !== 200) {
      res.setHeader('Content-Type', response.headers['content-type']);
      return res.status(response && response.statusCode || 500).send(error || body);
    }

    try {
      var results = JSON.parse(body);
    } catch (e) {
      logger.error(body);
      return res.status(500).send('something went wrong');
    }

    res.status(200).send(results);
  });
}

function advancedSearch(req, res) {
  var data = _.merge({
    fields: ['*'],
    appId:  config.nutritionix_api.id,
    appKey: config.nutritionix_api.key
  }, req.body);

  request({
    method: 'POST',
    url:    'https://api.nutritionix.com/v1_1/search/',
    body:   data,
    json:   true

  }, function (error, response, body) {
    if (error) {
      logger.error(error);
      return res.status(500).send('search is broken');
    }

    res.setHeader('Content-Type', response.headers['content-type']);
    if (response.statusCode !== 200) {
      return res.status(response && response.statusCode || 500).send(error || body);
    }

    res.send(body);
  });
}

function recentlyAddedProducts(req, res, next) {
  knex
    .select(['i._id as item_id', 'i.item_name', 'b._id as brand_id', 'b.name as brand_name', 'i.created_at', 'i.item_type'])
    .from('nutritionix-api.v1_items as i')
    .join('nutritionix-api.v1_brands as b', 'b._id', '=', 'i.brand_id')
    .where('i.deleted', '=', 0)
    .whereIn('i.item_type', req.query.common ? [3] : [1, 2])
    .orderBy('i.created_at', 'DESC')
    .limit(100)
    .then(function (rows) {
      res.json(rows);
    })
    .catch(function (error) {
      logger.error(error);
      res.status(500).json({'message': 'unexpected error'});
    })
}

module.exports = foodRouter;
