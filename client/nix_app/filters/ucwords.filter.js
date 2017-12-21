(function () {
  'use strict';

  angular
    .module('nutritionix')
    .filter('ucwords', function () {
      return function (string) {
        return (string && string.toString() || '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
          return $1.toUpperCase();
        });
      };
    });

}());
