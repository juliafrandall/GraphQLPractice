(function () {
  'use strict';

  angular
    .module('premium', ['nutritionix'])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('site.premium', {
      url:         '/premium/implementation',
      metaTags:    {
        title:       'Nutritionix - Premium Implementation',
        description: 'Nutritionix - Premium Implementation'
      },
      templateUrl: baseUrl + '/nix_app/premium/premium.html',
      onEnter:     function ($anchorScroll) {
        $anchorScroll();
      }
    });
  }
})();
