(function () {
  'use strict';

  angular.module('nutritionix')
    .directive('nixHref', function ($window, $location) {
      return function (scope, element, attributes) {
        element.on('click', function (e) {
          $location.url(scope.$eval(attributes.nixHref));
          scope.$apply();
        });
      }
    })
}());
