(function () {
  'use strict';

  angular
    .module('mini')
    .directive('mini', mini);

  function mini(ServicesFactory) {
    return {
      templateUrl: ServicesFactory.formatTemplateUrl('/nix_app/mini/mini.html'),
      scope:       true,
      controller:  'miniCtrl as vm',
      link:        function (scope, element, attributes) {
        scope.title   = attributes.title || 'Want to learn more? Contact us.';
        scope.inquiry = attributes.inquiry;

        if (attributes.subject) {
          scope.subject = attributes.subject;
        } else {
          scope.$watch(function () {
            return _.trim(angular.element('h1:visible').first().text());
          }, function (h1) {
            if (h1) {
              scope.subject = 'Contact Form - ' + h1;
            } else {
              scope.subject = '';
            }
          });
        }
      }
    };
  }
})();
