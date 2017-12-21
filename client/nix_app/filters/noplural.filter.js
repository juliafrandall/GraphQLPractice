(function () {
  'use strict';

  angular
    .module('nutritionix')
    .filter('noplural', function ($filter) {
      return function (string, count) {
        string = (string || '').toString();

        if (string.length && string[string.length - 1] === 's') {
          count = parseFloat($filter('smartNumber')(count, false, true));

          if (count <= 1) {
            string = string.substring(0, string.length - 1);
          }
        }

        return string;
      }
    });

}());
