'use strict';

angular.module('account.coach-portal')
  .directive('accessCode', function () {
    return {
      restrict: 'A',
      require:  'ngModel',
      link:     function link(scope, element, attributes, ngModel) {
        scope.$watch(attributes.ngModel, (currentValue, previousValue) => {
          if (currentValue && previousValue && previousValue.length === 2 && currentValue.length === 3) {
            currentValue += '-';
          }

          if (currentValue && currentValue.length === 6 && currentValue.indexOf('-') === -1) {
            currentValue = currentValue.substr(0, 3) + '-' + currentValue.substr(3);
          }

          currentValue = (currentValue || '').toUpperCase();

          ngModel.$setViewValue(currentValue);
          ngModel.$render();
        });
      }
    }
  });
