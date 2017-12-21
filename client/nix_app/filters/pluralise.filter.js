(function () {
  'use strict';

  angular
    .module('nutritionix')
    .filter('pluralize', function () {
      return function (val) {
        val = val && val.toString() || '';
        if(val[val.length - 1] !== 's'){
          val += 's';
        }
        return val;
      }
    });

}());
