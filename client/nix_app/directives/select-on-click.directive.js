(function () {
  'use strict';

  angular.module('nutritionix')
    .directive('selectOnClick', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.on('click', function () {
                    if (!window.getSelection().toString()) {
                      if (attrs.type === 'text') {
                        // Required for mobile Safari
                        this.setSelectionRange(0, this.value.length);
                      } else {
                        // above will work only on text inputs.
                        this.select();
                      }
                    }
                });
            }
        };
    });
}(window));
