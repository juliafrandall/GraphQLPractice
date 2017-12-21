(function () {
  'use strict';

  angular
    .module('banner')
    .directive('banner', banner);

  function banner(ServicesFactory, $state) {
    return {
      restrict: 'A',
      replace: true,
      scope: { banner: '=banner' },
      templateUrl: ServicesFactory.formatTemplateUrl('/nix_app/banner/banner.html'),
      link: function(scope, elem, attr) {

        if(scope.banner) {
          scope.title = scope.banner.title;
          scope.text = scope.banner.text;
          scope.icon = scope.banner.icon;
          scope.link = scope.banner.link;
        }

        scope.getLink = function() {
            $state.go(scope.link || 'site.businessApi');
        };

      }
    }
  }
}());
