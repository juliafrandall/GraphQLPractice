(function () {
  'use strict';

  angular
    .module('business', [])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('site.business', {
      url:         '/business',
      metaTags:    {
        title:       'Nutritionix - Business Solutions',
        description: 'Overview of Nutritionix business solutions.'
      },
      templateUrl: baseUrl + '/nix_app/business/business.html',
      controller:  'businessCtrl',
      onEnter:     function ($anchorScroll) {
        $anchorScroll();
      }
    });
  }
})();
