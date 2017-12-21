(function () {
  'use strict';

  angular
    .module('privacy', [])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('site.privacy', {
      url:         '/privacy',
      metaTags:    {
        title:       'Nutritionix - Privacy Policy',
        description: 'Nutritionix - Privacy Policy'
      },
      controller:  'PrivacyCtrl',
      templateUrl: baseUrl + '/nix_app/privacy/privacy.html',
      onEnter:     function ($anchorScroll) {
        $anchorScroll();
      }
    });
  }
})();
