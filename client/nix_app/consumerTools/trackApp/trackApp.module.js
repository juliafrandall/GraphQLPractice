(function () {
  'use strict';

  angular
    .module('trackApp', ['slickCarousel'])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('site.trackApp', {
      url:         '/app',
      metaTags:    {
        title:       'Nutritionix Track App - Free calorie counter with weight and exercise tracking',
        description: 'Nutritionix Track App Walkthrough'
      },
      templateUrl: baseUrl + '/nix_app/consumerTools/trackApp/trackApp.html',
      controller:  'trackAppCtrl as vm',
      data : {
        cssClass:   'track-app'
      },
      resolve: {
        stats: StatbarFactory => StatbarFactory.getStats()
      },
      onEnter:     function ($anchorScroll) {
        $anchorScroll();
      }
    });
  }
})();
