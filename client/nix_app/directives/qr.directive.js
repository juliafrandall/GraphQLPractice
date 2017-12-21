(function () {
  'use strict';

  angular.module('nutritionix')
    .directive('qr', function () {
      return {
        restrict: 'E',
        link:     function (scope, element, attrs) {
          let image = scope.$eval(attrs.image);
          let download = scope.$eval(attrs.download);

          if (image && download) {
            let a = angular.element('<a>');

            scope.$watch(() => attrs.downloadName, downloadName => {
              a.prop('download', (downloadName || 'qr') + '.png');
            });

            scope.$watch(() => attrs.downloadLinkText, downloadLinkText => {
              a.text(downloadLinkText || 'Download');
            });

            scope.$watch(() => element.find('img').attr('src'), src => a.attr('href', src));

            element.append(angular.element('<div>').append(a));
          }

          if (image && attrs.viewSize) {
            scope.$watchGroup(
              [() => element.find('img')[0], () => attrs.viewSize],
              values => {
                let img = values[0];
                let size = values[1];

                if (img && size) {
                  angular.element(img).css({width: size, height: size});
                }
              }
            )
          }
        }
      };
    });
}(window));
