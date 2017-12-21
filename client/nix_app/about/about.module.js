(function () {
  'use strict';

  angular
    .module('about', [])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('site.about', {
      url:         '/about',
      metaTags:    {
        title:       'Nutritionix - About Our Team',
        description: 'Read more about the Nutritionix team'
      },
      templateUrl: baseUrl + '/nix_app/about/about.html',
      controller:  'aboutCtrl as vm',
      onEnter:     function ($anchorScroll) {
        $anchorScroll();
      }
    });
  }
})();
