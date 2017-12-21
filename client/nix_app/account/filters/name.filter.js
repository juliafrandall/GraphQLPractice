(function () {
  'use strict';

  angular.module('nutritionix')
    .filter('name', function () {
      return function name(user) {
        return `${user.first_name || ''} ${user.last_name || ''}`.trim();
      }
    })
}());
