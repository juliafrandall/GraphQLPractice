(function () {
  'use strict';

  angular.module('nutritionix')
    .directive('nixAction', function () {
      return function (scope, element, attributes) {
        element.attr('action', attributes.nixAction);
      };
    });
}());
