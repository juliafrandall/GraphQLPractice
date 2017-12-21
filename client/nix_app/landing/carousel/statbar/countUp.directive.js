(function () {
  'use strict';

  angular
    .module('statbar')
    .directive('countUp', countUp)

  function countUp($timeout) {
    return {
      replace: false,
      scope: true,
      link: function (scope, element, attrs) {
        var e = element[0];
        var num, refreshInterval, duration, steps, step, countUp, value, increment;

        var calculate = function () {
          refreshInterval = 30;
          step = 0;
          scope.timoutId = null;
          countUp = parseInt(attrs.countUp) || 0;
          scope.value = parseInt(attrs.value, 10) || 0;
          duration = (parseFloat(attrs.duration) * 1000) || 0;

          steps = Math.ceil(duration / refreshInterval);
          increment = ((countUp - scope.value) / steps);
          num = scope.value;
        }

        var tick = function () {
          scope.timoutId = $timeout(function () {
            num += increment;
            step++;
            if (step >= steps) {
              $timeout.cancel(scope.timoutId);
              num = countUp;
              e.textContent = countUp;
            } else {
              e.textContent = Math.round(num);
              tick();
            }
          }, refreshInterval);

        }

        var start = function () {
          if (scope.timoutId) {
            $timeout.cancel(scope.timoutId);
          }
          calculate();
          tick();
        }

        attrs.$observe('countUp', function (val) {
          if (val) {
            start();
          }
        });

        attrs.$observe('value', function (val) {
          start();
        });

        return true;
      }
    }
  }

})();
