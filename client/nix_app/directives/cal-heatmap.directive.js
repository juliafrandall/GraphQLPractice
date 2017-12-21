(function () {
  'use strict';

  angular.module('nutritionix')
    .directive('calHeatMap', function ($filter) {
      return {
        template: `<div style="display: inline-block">
                      <button class="previous" class="btn"><i class="fa fa-chevron-left"></i></button>
                      <button class="next" class="btn"><i class="fa fa-chevron-right"></i></button>
                      <div class="heatMap"></div>
                  </div>`,
        replace:  true,
        restrict: 'AE',
        scope:    {
          data:            '=',
          afterLoadDomain: '=',
          legend:          '='
        },
        link:     function (scope, element, attributes) {
          var cal = new CalHeatMap();
          var buttons = {
            next:     element.find(".next"),
            previous: element.find(".previous")
          };

          cal.formatNumber = number => $filter('number')($filter('fdaRound')(number, 'calories'), 0);

          cal.init({
            tooltip:                 true,
            itemSelector:            element.find('.heatMap')[0],
            nextSelector:            buttons.next[0],
            previousSelector:        buttons.previous[0],
            domain:                  "month",
            subDomain:               "x_day",
            subDomainTextFormat:     "%d",
            range:                   1,
            start:                   new Date(),
            minDate:                 new Date(),
            maxDate:                 new Date(),
            afterLoadPreviousDomain: function (date) {
              scope.afterLoadDomain(date);
              scope.$apply();
            },
            afterLoadNextDomain:     function (date) {
              scope.afterLoadDomain(date);
              scope.$apply();
            },
            onMinDomainReached:      function (hit) {
              buttons.previous.attr("disabled", hit ? "disabled" : false);
            },
            onMaxDomainReached:      function (hit) {
              buttons.next.attr("disabled", hit ? "disabled" : false);
            },

            legend:                   scope.legend,
            displayLegend:            true,
            legendHorizontalPosition: 'center',
            cellSize:                 28,

            label:                {
              position: "top",
              align:    "left",
              offset:   {x: -103, y: 0}
            },
            weekStartOnMonday:    false,
            domainLabelFormat:    "%B %Y",
            subDomainTitleFormat: {
              empty:  "not tracked",
              filled: "{count} Calories"
            }
          });

          scope.$watchCollection('data', function () {
            let data = scope.data;
            if (data) {
              cal.update(data);
              cal.options.data = data;
              cal.options.minDate = new Date(+_.min(_.keys(data)) * 1000);
              cal.onMinDomainReached(cal.minDomainIsReached(moment().startOf('month').unix() * 1000));
            }
          });
        }
      }
    });
}());
