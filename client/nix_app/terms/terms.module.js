(function () {
  'use strict';

  angular
    .module('terms', ['nutritionix'])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('site.terms', {
      url:         '/terms',
      metaTags:    {
        title:       'Nutritionix - Terms and Conditions',
        description: 'Nutritionix - Terms and Conditions'
      },
      templateUrl: baseUrl + '/nix_app/terms/terms.html',
      onEnter:     function ($anchorScroll) {
        $anchorScroll();
      }
    })
    .state('site.apiterms', {
      url:         '/apiterms',
      metaTags:    {
        title:       'Nutritionix - API Terms and Conditions',
        description: 'Nutritionix - API Terms and Conditions'
      },
      templateUrl: baseUrl + '/nix_app/terms/api-terms.html',
      onEnter:     function ($anchorScroll) {
        $anchorScroll();
      }
    });
  }
})();
