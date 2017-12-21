(function () {
  'use strict';

  angular.module('nutritionix')
    .directive('placeholder', function () {
      return {
        restrict: 'A',
        link:     function (scope, element, attributes) {
          if (element.prop('nodeName') === 'TEXTAREA') {
            let placeholderText = attributes.placeholder.trim();

            if (placeholderText.length) {
              let placeholderLines = Array.prototype.concat
                .apply([], placeholderText.split('\n').map(line => line.split('\\n')))
                .map(line => line.trim());

              if (placeholderLines.length > 1) {
                element.watermark(placeholderLines.join('<br>\n'));
                let watermark = element.closest('span.watermark_container').find('label.watermark');
                scope.$watch(() => element.val(), value => {
                  if (value) {
                    watermark.hide();
                  }
                })
              }
            }
          }
        }
      };
    });
}());
