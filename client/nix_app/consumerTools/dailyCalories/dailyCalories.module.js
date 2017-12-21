(function () {
  'use strict';

  angular
    .module('dailyCalories', [])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('site.dailyCalories', {
      url:         '/consumer/calculate-daily-calories',
      metaTags:    {
        title:       'Nutritionix - Daily Calories',
        description: 'Calculate recommended daily calories'
      },
      templateUrl: baseUrl + '/nix_app/consumerTools/dailyCalories/dailyCalories.html',
      controller:  'dailyCaloriesCtrl as vm',
      resolve:     {
        $modalInstance: () => null
      },
      onEnter:     function ($anchorScroll, forceHttps) {
        forceHttps();
        $anchorScroll();
      }
    });
  }
})();
