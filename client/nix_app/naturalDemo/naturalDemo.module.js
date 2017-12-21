(function () {
  'use strict';

  angular
    .module('naturalDemo', [])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider
      .state('site.naturalDemo', {
        url:         '/natural-demo',
        metaTags:    {
          title: 'Nutritionix - Natural Language API Demo',
          description: 'Nutritionix - Natural Language Food Endpoint Demo'
        },
        templateUrl: baseUrl + '/nix_app/naturalDemo/naturalDemo.html',
        controller:  'naturalDemoCtrl as vm',
        onEnter:     function ($anchorScroll) {
          $anchorScroll();
        }
      })
      .state('site.naturalDemoExercise', {
        templateUrl: baseUrl + '/nix_app/naturalDemo/exercise.html',
        url:         '/natural-demo/exercise',
        metaTags:    {
          title: 'Nutritionix - Natural Language API Demo',
          description: 'Nutritionix - Natural Language Exercise Endpoint Demo'
        },
        controller:  'naturalDemoCtrlExerciseCtrl as vm',
        onEnter:     function ($anchorScroll) {
          $anchorScroll();
        }
      });
  }
})();
