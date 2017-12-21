(function () {
  'use strict';

  angular.module('nutritionix')
    .directive('unreleased', function (developerMode) {
      return function (scope, element /*, attributes*/) {
        element.toggle(developerMode);
      };
    });
}());
