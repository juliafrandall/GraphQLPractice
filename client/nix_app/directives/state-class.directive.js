(function () {
  'use strict';

  angular.module('nutritionix')
    .directive('stateClass', function ($rootScope) {
      return function (scope, element, attributes) {
        let stateClass = attributes.stateClass;

        if (stateClass) {
          $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState/*, fromParams*/) {
            let prevClass = fromState.data && fromState.data[stateClass];
            let curClass = toState.data && toState.data[stateClass];

            if (prevClass !== curClass) {
              if (prevClass) {
                element.removeClass(prevClass);
              }

              if (curClass) {
                element.addClass(curClass);
              }
            }
          });
        }
      };
    });
}());
