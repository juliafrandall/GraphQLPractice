(function () {
  'use strict';

  angular
    .module('nutritionix')
    .filter('ucfirst', function () {
      return function (string) {
        string = string && string.toString() || '';
        if(string.length > 0){
          return string[0].toUpperCase() + string.substring(1);
        }

        return '';
      };
    });

}());
