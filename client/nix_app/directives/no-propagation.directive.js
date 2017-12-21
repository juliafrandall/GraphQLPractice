(function () {
  'use strict';

  angular.module('nutritionix')
    .directive('noPropagation', function () {
      return function (scope, element) {
        element.on('click', function (e) {
          e.stopPropagation();
        });
      }
    })
}());
