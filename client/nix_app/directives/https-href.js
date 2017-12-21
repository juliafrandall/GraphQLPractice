(function () {
  'use strict';

  angular.module('nutritionix')
    .directive('httpsHref', function ($window, $location, $log) {
      return {
        priority: 1,
        restrict: 'A',
        link:     function (scope, element, attributes) {
          let href = attributes.httpsHref;

          if (href && href !== '#' && href.substr(0, 8) !== 'https://') {
            if ($location.host().match('localhost')) {
              $log.debug(`not forcing https link on localhost: ${href}`)
            } else {
              if (href.substr(0, 7) === 'http://') {
                href = href.replace('http://', 'https://');
              } else {
                href = 'https://' + $window.location.host + href;
              }
            }

            element.attr('href', href);
          }
        }
      }
    })
}());
