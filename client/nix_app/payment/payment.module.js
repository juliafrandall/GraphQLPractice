(function () {
  'use strict';

  angular
    .module('payment', ['nutritionix'])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('site.payment', {
      url:         '/payment',
      metaTags:    {
        title:       'Nutritionix',
        description: 'Nutritionix'
      },
      templateUrl: baseUrl + '/nix_app/payment/payment.html',
      onEnter:     function ($anchorScroll) {
        $anchorScroll();
      }
    });
  }
})();
