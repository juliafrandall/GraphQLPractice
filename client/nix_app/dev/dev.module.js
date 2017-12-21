(function () {
  'use strict';

  angular
    .module('dev', [])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider
      .state('dev', {
        abstract:    true,
        templateUrl: baseUrl + '/nix_app/layouts/dev.html'
      })
      .state('dev.corporateWellness', {
        url:         '/dev/business/corporate-wellness',
        metaTags:    {
          title:       'Nutrition Corporate Wellness',
          description: 'Corporate Wellness'
        },
        templateUrl: baseUrl + '/nix_app/dev/business/corporate-wellness.html',
        controller:  'CorporateWellnessCtrl as vm',
        data:        {
          cssClass: 'dev'
        },
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
