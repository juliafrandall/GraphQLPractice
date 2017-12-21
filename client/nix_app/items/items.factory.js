(function () {
  'use strict';

  angular.module('nutritionix')
    .factory('ItemFactory', ItemFactory);

  function ItemFactory($http, nixTrackApiClient) {
    var factory = {
      searchItemById: searchItemById,
      getNdbNoInfo: getNdbNoInfo,
      searchItems: searchItems
    };

    function searchItemById(itemId) {
      return $http.get('/nixapi/items/' + itemId)
        .then(function (data) {
          var item = data.data;
          item.ratio_protein = Math.round(item.protein / item.metric_qty * 1000) / 1000;
          item.ratio_calories = Math.round(item.calories / item.metric_qty * 10) / 10;
          item.ratio_carb = Math.round(item.total_carb / item.metric_qty * 1000) / 1000;
          item.ratio_sodium = Math.round(item.sodium / item.metric_qty * 1000) / 1000;
          item.ratio_fat = Math.round(item.total_fat / item.metric_qty * 1000) / 1000;
          item.ratio_sugars = Math.round(item.sugars / item.metric_qty * 1000) / 1000;
          return item;
        });
    }

    function getNdbNoInfo(ndb) {
      return $http.get('/nixapi/ndb/' + ndb)
        .then(function (data) {
          return data.data;
        });
    }

    function searchItems(query) {
      return nixTrackApiClient('/search/instant', {
        method: 'GET',
        params: {
          query,
          branded:  true,
          common:   true,
          self:     false,
          detailed: false
        }
      })
        .then(response => {
          const data = response.data;

          if (data.common.length) {
            return nixTrackApiClient('/natural/nutrients', {
              method: 'POST',
              data:   {
                query:          _.unique(data.common, f => f.tag_id).map(f => f.food_name).join('\n'),
                line_delimited: true
              }
            })
              .then(response => {
                data.common = response.data.foods;
                return data;
              })
          }

          return data;
        });
    }

    return factory;
  }
})();
