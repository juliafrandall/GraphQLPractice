(function () {
  'use strict';

  angular.module('nutritionix')
    .directive('usPhone', function () {
      return {
        require: 'ngModel',
        link:    function (scope, elm, attrs, ngModelController) {
          ngModelController.$validators.usPhone = function (modelValue, viewValue) {
            if (!viewValue) {return null;}
            return viewValue.replace(/[^\d]/g, '').length === 10;
          };
        }
      };
    });
}());
