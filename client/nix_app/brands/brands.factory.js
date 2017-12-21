(function () {
  'use strict';

  angular.module('nutritionix')
    .factory('BrandsFactory', BrandsFactory);

  function BrandsFactory($http, $q, cdnUrls) {
    var factory = {
      init:                         init,
      getBrand:                     getBrand,
      searchBrands:                 searchBrands,
      getBrandProducts:             getBrandProducts,
      getRestaurantsCalculatorData: getRestaurantsCalculatorData,
      cachedGroceryBrands:          null,
      cachedRestaurantBrands:       null
    };

    function init() {
      return $http.get('/nixapi/brands/init')
        .error(function (data) {
          console.log('first time loading brand page', data);
        })
    }

    function getRestaurantsCalculatorData() {
      if (!getRestaurantsCalculatorData.$data) {
        getRestaurantsCalculatorData.$data = $http.get(cdnUrls['nix-export'] + '/restaurant-calculators.json.gz')
          .then(response => response.data)
          .catch(() => []);
      }

      return getRestaurantsCalculatorData.$data;
    }

    function searchBrands(type) {
      //caches brands.
      if (type === 'grocery' && factory.cachedGroceryBrands !== null) {
        return $q(function (resolve) {
          resolve(factory.cachedGroceryBrands);
        })
      }
      if (type === 'restaurant' && factory.cachedRestaurantBrands !== null) {
        return $q(function (resolve) {
          resolve(factory.cachedRestaurantBrands);
        })
      }

      return $http.get(cdnUrls['nix-export'] + '/brands-' + type + '.json.gz')
        .then(function (response) {
          var brands = response.data;
          _.forEach(brands, function (item) {
            if (item.logo === null) {
              item.logo = cdnUrls['cdn4-nutritionix'] + "/images/gray_nix_apple_small.png"
            }
          });
          if (type === 'restaurant') {
            factory.cachedRestaurantBrands = brands;
          }
          if (type === 'grocery') {
            factory.cachedGroceryBrands = brands;
          }
          return brands
        });
    }

    function getBrand(id) {
      return $http.get('/nixapi/brands/' + id)
        .then(function (response) {
          return response.data;
        });
    }

    function getBrandProducts(id, page, search, limit) {
      return $http.get('/nixapi/brands/' + id + '/items/' + (page || 1), {params: {search: search, limit: limit}})
        .then(function (response) {
          return response.data;
        });
    }

    return factory;
  }
})();
