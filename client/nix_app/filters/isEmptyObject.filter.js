(function () {
  'use strict';

  angular
    .module('nutritionix')
    .filter('isEmptyObject', function () {
      return function (value){
        return _.isEmpty(value);
      }
    });

}());
