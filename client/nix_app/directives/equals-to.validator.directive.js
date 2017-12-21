(function () {
  'use strict';

  angular.module('nutritionix')
    .directive('equalsTo', function () {
      return {
        require: 'ngModel',
        link:    function (scope, elm, attrs, ngModel) {
          scope.$watchGroup([attrs.equalsTo, () => ngModel.$modelValue], newVal => {
            ngModel.$setValidity('equalsTo', newVal[0] === newVal[1]);
          });
        }
      };
    })
}());
