(function () {
  'use strict';

  angular
    .module('customer', ['angular-stripe'])
    .config(config);

  function config($stateProvider, stripeProvider) {
    $stateProvider.state('site.customer', {
      url:         '/customer/:customerId?key',
      metaTags:    {
        title:       'Nutritionix - Update Credit Card Info',
        description: 'Update Credit Card Info'
      },
      templateUrl: '/nix_app/customer/customer.html',
      controller:  'customerCtrl as vm',
      onEnter:     function ($anchorScroll) {
        $anchorScroll();
      }
    });

    if(location.hostname.replace('www.', '') === 'nutritionix.com'){
      stripeProvider.setPublishableKey('pk_live_ciNVhET1Asq0JswIDu7iQh5e');
    } else {
      stripeProvider.setPublishableKey('pk_test_zMZg9XjlsO1DE1PhsRoFaVWv');
    }
  }
})();
