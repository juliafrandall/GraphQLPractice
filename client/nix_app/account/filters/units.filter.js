(function () {
  'use strict';

  angular.module('account')
    .filter('kgToUserUnits', function (user) {
      return function (kg) {
        let measureSystem = user.get('measure_system');

        if (measureSystem === 1) {
          return kg;
        }

        return kg * 2.20462;
      }
    })
}());
