(function () {
  'use strict';

  angular
    .module('nutritionlink', [])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('site.nutritionlink', {
      url:         '/business/nutritionlink',
      templateUrl: baseUrl + '/nix_app/business/nutritionlink/nutritionlink.html',
      onEnter:     function ($anchorScroll) {
        $anchorScroll();
      }
    });
  }
})();
