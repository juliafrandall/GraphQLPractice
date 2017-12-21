(function () {
  'use strict';

  angular.module('nutritionix')
    .directive('button', function () {
      return {
        restrict: 'E',
        link:     function (scope, element) {
          element.on('mouseup', e => {element.blur()});
        }
      }
    })
}());
