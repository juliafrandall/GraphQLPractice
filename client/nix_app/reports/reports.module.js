(function () {
  'use strict';

  angular
    .module('reports', ['chart.js', 'angular-jqcloud'])
    .config(config)
    .run(run);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('reports', {
      abstract: true,
      url:      '^/reports',
      template: '<div ui-view></div>',
      data:     {requiresLogin: true},
      onEnter:  function (forceHttps) {
        forceHttps();
      }
    });

    $stateProvider.state('reports.nutrient', {
      url:         '/1?begin&end',
      templateUrl: baseUrl + '/nix_app/reports/nutrient.html',
      controller:  'ReportsNutrientCtrl as vm'
    });

    $stateProvider.state('reports.nutrient2', {
      url:         '/2?begin&end',
      templateUrl: baseUrl + '/nix_app/reports/nutrient2.html',
      controller:  'ReportsNutrient2Ctrl as vm'
    });

    $stateProvider.state('reports.nutrient3', {
      url:         '/3?begin&end',
      controller:  'ReportsNutrient3Ctrl as vm',
      templateUrl: baseUrl + '/nix_app/reports/nutrient3.html'
    });

    $stateProvider.state('reports.word-cloud', {
      url:         '/4',
      controller:  'ReportsWordCloudCtrl',
      templateUrl: baseUrl + '/nix_app/reports/word-cloud.html'
    });
  }

  function run($rootScope) {
    $rootScope.$on('$stateChangeSuccess',
      function (event, toState/*, toParams, fromState, fromParams*/) {
        $rootScope.isReport = toState.name.split('.')[0] === 'reports';
      });
  }
})();
