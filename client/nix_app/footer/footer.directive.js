(function () {
  'use strict';

  angular
    .module('footer')
    .directive('footer', footer);

  function footer(ServicesFactory) {
    return {
      templateUrl: ServicesFactory.formatTemplateUrl('/nix_app/footer/footer.html'),
      scope: true,
      controller: 'FooterCtrl as vm'
    };
  }
})();
