(function () {
  'use strict';

  angular
    .module('grocery')
    .filter('divide', function () {
      return function (value, factor) {
        return value / factor || 0;
      };
    });

}());
