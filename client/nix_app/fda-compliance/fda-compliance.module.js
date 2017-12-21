(function () {
  'use strict';

  angular
    .module('fda-compliance', [])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('site.fda-compliance', {
      url:         '/fda-compliance',
      metaTags:    {
        title:       'Nutritionix - FDA Menu Labeling Compliance Made Easy',
        description: 'FDA Menu Labeling Compliance for Restaurants'
      },
      templateUrl: baseUrl + '/nix_app/fda-compliance/fda-compliance.html',
      controller:  'fdaComplianceCtrl',
      onEnter:     function ($anchorScroll) {
        $anchorScroll();
      }
    });
  }
})();
