(function () {
  'use strict';

  angular
    .module('nutritionix')
    .filter('caloriesfda', function () {
      return function (calories) {
        var calories = Math.round(calories + 0);
        if (calories < 5) return 0;
        if (calories >= 5 && calories <= 50) return (5 * Math.round(calories / 5));
        else return (Math.round(calories / 10) * 10);
      };
    });
}());
