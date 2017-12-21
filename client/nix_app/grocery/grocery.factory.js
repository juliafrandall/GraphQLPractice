(function () {
  'use strict';

  angular.module('nutritionix')
    .factory('GroceryFactory', GroceryFactory);

  function GroceryFactory($http, $q) {
    var factory = {
      getTagData: getTagData,
      getCategories: getCategories
    };

    function getTagData(tagId, usdaNdb) {
      var idPromise;
      if (tagId) {
        idPromise = $q.resolve(tagId);
      } else if (usdaNdb) {
        idPromise = $http.get('nixapi/getTagByNdb/' + usdaNdb)
          .then(function (response) {
            return response.data;
          })
      } else {
        return $q.resolve(null);
      }

      return idPromise.then(function (tagId) {
        if (!tagId) { return null; }
        return $http.get('https://nix-export.s3.amazonaws.com/tagstats/' + tagId + '.json.gz')
          .success(function (data) {
            _.forEach(data.items, (function (item) {
              if (!(item.package_url || '').replace(/\s/g, '')) {
                item.package_url = 'https://s3.amazonaws.com/cdn4-nutritionix/images/gray_nix_apple.png';
                item.has_default_package_url = true;
              }
            }));

            return data;
          });
      });
    }

    function getCategories() {
      return $http.get('/nixapi/categories')
        .error(function (err) {
          console.log('error', err);
        })
    }

    return factory;
  }
})();
