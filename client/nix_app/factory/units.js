(function () {
  'use strict';

  angular.module('nutritionix')
    .factory('units', function (user) {
      return {
        oz: {
          metricFactor: 0.0295735296,
          toLitres:     function (oz) {
            return oz * this.metricFactor;
          },
          fromLitres:   function (litres) {
            return litres / this.metricFactor;
          }
        }
      };
    })
    .filter('volume', function (user, units) {
      return function (litres, addSuffix = false) {
        litres = parseFloat(litres);
        if (_.isNaN(litres)) {
          litres = 0;
        }

        let isMetric = user.get('measure_system');

        let value = isMetric ? litres : units.oz.fromLitres(litres);
        value     = _.round(value, isMetric ? 2 : 0);

        if (addSuffix) {
          value += ' ' + (isMetric ? 'L' : 'oz');
        }

        return value;
      };
    })
}());
