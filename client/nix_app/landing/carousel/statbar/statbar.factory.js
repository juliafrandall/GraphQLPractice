(function () {
  'use strict';

  angular
    .module('nutritionix')
    .factory('StatbarFactory', StatbarFactory);

  function StatbarFactory($http) {
    function getStats() {
      if (!getStats.$promise) {
        getStats.$promise = $http.get('//d1gvlspmcma3iu.cloudfront.net/item-totals.json')
          .then(response => {
            let stats = response.data;

            ['cpg_count', 'cpg_images_count', 'restaurant_count', 'usda_count', 'restaurant_brands', 'cpg_brands']
              .forEach(key => {
                stats[key] = parseInt(stats[key]);
              });

            stats.total_count = stats.cpg_count + stats.restaurant_count + stats.usda_count;

            return stats;
          });
      }
      return getStats.$promise;
    }

    return {
      getStats: getStats
    };

  }
})();
