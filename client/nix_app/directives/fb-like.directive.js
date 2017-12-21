(function () {
  'use strict';

  angular
    .module('nutritionix')
    .directive('fbLike', function () {
      return {
        restrict: 'EA',
        replace: true,
        template: `
        <div class="fb-like"
          data-href="https://www.facebook.com/nutritionix"
          data-width="225"
          data-layout="standard"
          data-action="like"
          data-size="small"
          data-show-faces="false"
          data-share="false">
        </div>`
      }
    });

})();
