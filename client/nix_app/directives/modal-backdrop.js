'use strict';

angular.module('nutritionix')
  .directive('modalBackdrop', function () {
    return {
      priority: 1,
      link:     function (scope, element) {
        angular.element('.modal-backdrop').not(element).hide();
      }
    }
  });
