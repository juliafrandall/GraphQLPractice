(function () {
  'use strict';

  angular
    .module('businessApi', [])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('site.businessApi', {
      url:         '/business/api',
      metaTags:    {
        title:       'Nutrition API by Nutritionix',
        description: 'The Nutritionix API powers hundreds of health and fitness applications with a best-in-cass nutrition database solution.'
      },
      templateUrl: baseUrl + '/nix_app/business/api/api.html',
      controller:  'businessApiCtrl as vm',
      resolve:     {
        stats: function (StatbarFactory) {
          return StatbarFactory.getStats();
        }
      },
      onEnter:     function ($anchorScroll) {
        $anchorScroll();
      }
    });
  }
})();
