(function (window, document, angular, undefined) {
  'use strict';
  angular.module('angular-prerender', [])
    .factory('prerender', function ($rootScope) {
      var prerender = {
        statusCode: 200,
        headers:    [],
        reset:      function () {
          this.statusCode = 200;
          this.headers = [];
        }
      };

      $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams) {
        prerender.reset();
      });

      return prerender;
    })
    .directive('head', function (prerender) {
      return {
        restrict: 'E',
        replace:  true,
        compile:  function compile(tElement, tAttrs, transclude) {
          var template = '<meta name="prerender-status-code" content="{{prerender.statusCode}}">' +
            '<meta ng-repeat="header in prerender.headers" name="prerender-header" content="{{header}}">';

          tElement.prepend(template);

          return function (scope, element, attributes) {
            scope.prerender = prerender;
          };
        }
      }
    })
})(window, document, window.angular);
