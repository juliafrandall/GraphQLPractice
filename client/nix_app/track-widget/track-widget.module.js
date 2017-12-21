(function () {
  'use strict';

  angular
    .module('track-widget', [])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('track-widget', {
      abstract: true,
      url:      '^/track-widget',
      template: '<div ui-view></div>',
      data:     {
        requiresLogin: true,
        cssClass: 'track-widget'
      },
      onEnter:  function (forceHttps) {
        forceHttps();
      }
    });

    $stateProvider.state('track-widget.log', {
      url:         '/log',
      templateUrl: baseUrl + '/nix_app/track-widget/track-widget.html',
      controller:  'TrackWidgetCtrl as vm',
      resolve:     {
        food:           () => null,
        $modalInstance: () => null
      }
    });
  }
})();
