angular.module('nutritionix').directive('modalBody', function () {
  'use strict';

  return {
    restrict: 'C',
    link:     function (scope, element) {
      element.on('touchend', function (e) {
        e.stopPropagation();
      });
    }
  };
});
