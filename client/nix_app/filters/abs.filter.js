(function () {
  'use strict';

  angular
    .module('nutritionix')
    .filter('abs', function () {
      return function (val){
        return Math.abs(val);
      }
    });

}());
