(function () {
  'use strict';

  angular
    .module('consumerTools', [])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('site.consumerTools', {
      url:         '/consumer',
      metaTags:    {
        title:       'Nutritionix - Consumer Tools',
        description: 'Overview of Nutritionix consumer tools.'
      },
      templateUrl: baseUrl + '/nix_app/consumerTools/consumerTools.html',
      controller:  'consumerToolsCtrl',
      onEnter:     function ($anchorScroll) {
        $anchorScroll();
      }
    });
  }
})();
