(function () {
  'use strict';

  angular
    .module('nutritionix')
    .filter('noFutureDate', function (moment) {
      return function (val) {
        return moment.min(moment(val), moment());
      }
    });

}());
