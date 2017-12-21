(function () {
  'use strict';

  angular
    .module('labs', ['labs.twitter', 'ngGeolocation', 'nemLogging', 'ui-leaflet', 'ui-rangeSlider'])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('site.labs', {
      abstract: true,
      template: '<div ui-view></div>',
      url:      '/labs'
    });

    $stateProvider.state('site.labs.locate-test', {
      url:         '/locate-test',
      metaTags:    {
        title:       'Restaurant Nutrition Map',
        description: 'Restaurant Nutrition Map'
      },
      controller:  'labsLocateTestCtrl',
      templateUrl: baseUrl + '/nix_app/labs/locate-test.html',
    });

    $stateProvider.state('site.labs.locate-ui', {
      url:         '/locate-ui',
      controller:  'labsLocateUICtrl',
      templateUrl: baseUrl + '/nix_app/labs/locate-ui.html',
    });
  }
})();
