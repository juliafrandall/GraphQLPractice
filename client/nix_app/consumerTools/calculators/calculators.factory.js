(function () {
  'use strict';

  angular.module('nutritionix')
    .factory('CalculatorsFactory', CalculatorsFactory);

  function CalculatorsFactory($http, $log) {
    return {
      getCalculators: function () {
        return $http.get('/nixapi/calculators')
          .error(function (data) {
            $log.error(data);
            return [];
          })
      }
    };
  }
})();
