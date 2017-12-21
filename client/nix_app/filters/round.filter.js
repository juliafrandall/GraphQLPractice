(function () {
  'use strict';

  angular
    .module('nutritionix')
    .filter('round', function () {
      return function (val, precision, suffix) {
        val = _.round(val, precision);

        if (precision < 0 && suffix) {
          val = val / Math.pow(10, -precision);

          if (_.isString(suffix)) {
            val = val.toString() + suffix;
          }
        }

        return val;
      }
    });

}());
