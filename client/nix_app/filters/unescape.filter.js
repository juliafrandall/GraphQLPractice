(function () {
  'use strict';

  angular
    .module('nutritionix')
    .filter('unescape', function () {
      const node = jQuery('<span/>');
      return function (string) {
        return node.html(string || '').text();
      }
    });

}());
