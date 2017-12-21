(function () {
  'use strict';

  angular.module('nutritionix')
    .factory('suggestFoods', function ($http, $filter, nixTrackApiClient, $q) {
      let suggestFoods = {};

      suggestFoods.grocery = function (search, offset, limit) {
        return $http
          .post('/nixapi/search', {
            'query':   search,
            'offset':  offset || 0,
            'limit':   limit || 10,
            'sort':    {
              'field': '_score',
              'order': 'desc'
            },
            'filters': {
              'item_type': 2
            }
          }, {ignoreLoadingBar: true})
          .then(response => response.data.hits
            .map(hit => nutritionixApiDataUtilities.convertV1ItemToTrackFood(hit.fields)));
      };

      suggestFoods.restaurants = function (search, limit, offset) {
        return $http
          .post('/nixapi/search', {
            'query':   search,
            'offset':  offset || 0,
            'limit':   limit || 10,
            'sort':    {
              'field': '_score',
              'order': 'desc'
            },
            'filters': {
              'item_type': 1
            }
          }, {ignoreLoadingBar: true})
          .then(
            response => response.data.hits
              .map(hit => nutritionixApiDataUtilities.convertV1ItemToTrackFood(hit.fields))
          );
      };

      suggestFoods.brand = function (search, limit, offset) {
        return $http
          .post('/nixapi/search', {
            'query':   search,
            'offset':  offset || 0,
            'limit':   limit || 10,
            'sort':    {
              'field': '_score',
              'order': 'desc'
            },
            "filters": {
              "not": {
                "item_type": 3
              }
            }
          }, {ignoreLoadingBar: true})
          .then(response => response.data.hits
            .map(hit => nutritionixApiDataUtilities.convertV1ItemToTrackFood(hit.fields)));
      };

      suggestFoods.commonPhrases = function (search, limit, offset) {
        if (!suggestFoods.commonPhrases.$data) {
          suggestFoods.commonPhrases.$data = $http.get('//nix-export.s3.amazonaws.com/upc_phrases.json.gz', {ignoreLoadingBar: true})
            .then(response => $filter('orderBy')(response.data, 'length'))
        }

        limit = limit || 10;
        offset = offset || 0;

        return suggestFoods.commonPhrases.$data
          .then(phrases => $filter('filter')(phrases, search).slice(offset, offset + limit));
      };

      suggestFoods.userAutocomplete = function (search, limit, offset) {
        if (!search) {return $q.when([]);}

        if (!suggestFoods.userAutocomplete.$data) {
          suggestFoods.userAutocomplete.$data = nixTrackApiClient('/me/autocomplete', {ignoreLoadingBar: true})
            .then(
              response => response.data.foods
                .sort((first, second) => second.ct - first.ct)
            )
        }

        limit = limit || 10;
        offset = offset || 0;

        return suggestFoods.userAutocomplete.$data
          .then(foods => $filter('filter')(foods, {food_name: search}).slice(offset, offset + limit))
      };

      // preload data on component initialisation. makes autocompletes smoother.
      suggestFoods.commonPhrases('noop');
      suggestFoods.userAutocomplete('noop');

      return suggestFoods;
    })
}());
