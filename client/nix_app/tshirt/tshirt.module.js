(function () {
  'use strict';

  angular
    .module('tshirt', [])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('site.tshirt', {
      url:         '/tshirt',
      metaTags:    {
        title:       'Nutritionix - I\'d Track That Official Slogan T-Shirt',
        description: ''
      },
      templateUrl: baseUrl + '/nix_app/tshirt/tshirt.html',
      controller:  'tshirtCtrl as vm',
      onEnter:     function ($anchorScroll) {
        $anchorScroll();
      }
    });
  }
})();
