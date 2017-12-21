(function () {
  'use strict';

  angular.module('nutritionix')
    .directive('number', function () {
      return {
        restrict: 'A',
        require:  'ngModel',
        link:     function (scope, elm, attrs, ctrl) {
          ctrl.$validators.number = function (modelValue, viewValue) {
            let regex = attrs.number === 'integer' ? /^\d+$/ : /^[0-9]*\.?[0-9]+$/;
            return !!(!viewValue || viewValue.match(regex));
          };
        }
      };
    })
}());
