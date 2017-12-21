(function () {
  'use strict';

  angular
    .module('databaseLicense', [])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('site.databaseLicense', {
      url:         '/business/database-license',
      templateUrl: baseUrl + '/nix_app/business/database-licensing/databaseLicense.html',
      controller:  'databaseLicenseCtrl as vm',
      onEnter:     function ($anchorScroll) {
        $anchorScroll();
      }
    });
  }
})();
