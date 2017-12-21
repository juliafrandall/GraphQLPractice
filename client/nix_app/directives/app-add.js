'use strict';

angular.module('nutritionix')
  .directive('appAdd', function () {
    return {
      restrict: 'EAC',
      replace:  true,
      template: `
      <div class="app-ad">
        <i class="fa fa-mobile fa-2x"></i>
        Try our free calorie counting app.
        <a href="/app" class="text-underline">
          Nutritionix Track.
        </a>
      </div>
    `
    }
  })
  .directive('appAddResponsive', function ($sce) {
    return {
      restrict: 'EAC',
      replace:  true,
      scope:    {
        gaEventCategory: '=',
        gaEventAction:   '=',
        gaEventLabel:    '='
      },
      template: '<iframe class="nix-ad" ng-src="{{iframeUrl}}"></iframe>',
      link:     function (scope) {
        let iframeUrl = '//nixdotcom.s3.amazonaws.com/nix_ad/ad.html';
        let params = [];

        for (let i in scope) if (scope.hasOwnProperty(i)) {
          if (i.substr(0, 7) === 'gaEvent' && scope[i]) {
            params.push(i.substr(7).toLowerCase() + '=' + scope[i]);
          }
        }

        if (params.length > 0) {
          iframeUrl += '?' + params.join('&');
        }

        scope.iframeUrl = $sce.trustAsResourceUrl(iframeUrl);
      }
    }
  });
