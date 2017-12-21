(function () {
  'use strict';

  angular
    .module('nutritionix')
    .filter('aboveZero', function () {
      return function (val) {
        return val < 0 ? 0 : val;
      }
    });

}());
