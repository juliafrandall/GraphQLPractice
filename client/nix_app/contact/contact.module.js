(function () {
  'use strict';

  angular
    .module('contact', [])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('site.contact', {
      url:         '/contact',
      metaTags:    {
        title:       'Nutritionix - Contact Us',
        description: 'Contact the Nutritionix team'
      },
      templateUrl: baseUrl + '/nix_app/contact/contact.html',
      controller:  'contactCtrl',
      onEnter:     function ($anchorScroll) {
        $anchorScroll();
      }
    });
  }
})();
