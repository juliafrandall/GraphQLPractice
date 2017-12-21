(function () {
  'use strict';

  angular
    .module('statbar')
    .directive('statbar', statbar);

  function statbar(ServicesFactory) {
    return {
      templateUrl: ServicesFactory.formatTemplateUrl('/nix_app/landing/carousel/statbar/statbar.html'),
      scope: true,
      controller: 'StatbarCtrl as vm'
    };
  }

})();
