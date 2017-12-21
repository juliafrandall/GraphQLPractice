(function () {
  'use strict';

  angular.module('nutritionix')
    .directive('hiddenLink', function ($window) {
      return function (scope, element) {
        element.hide();

        element.on('click', function (e) {
          e.stopPropagation();
        });

        angular.element($window).on('keydown', function (event) {
          if (event.altKey === true && event.which === 18) {
            element.show();
          }
        });

        angular.element($window).on('click keyup', function (event) {
          element.hide();
        });
      }
    })
}());
