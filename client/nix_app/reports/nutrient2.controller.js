(function (undefined) {
  'use strict';

  angular
    .module('about')
    .controller('ReportsNutrient2Ctrl', ReportsNutrient2Ctrl);

  function ReportsNutrient2Ctrl($scope, nixTrackApiClient, nixTrackUtils, $state, moment, $filter, $http, $timeout) {
    var vm = this;

    vm.nixTrackApiClient = nixTrackApiClient;

    vm.report = {
      chartLabels:   [],
      caloriesChart: {
        data:   [[], []],
        series: ['Calories Goal', 'Calories']
      },
      carbsChart:    {
        data:   [[]],
        series: ['Carbs']
      },
      proteinChart:  {
        data:   [[]],
        series: ['Protein']
      },
      sodiumChart:   {
        data:   [[]],
        series: ['Sodium']
      },

      pieChart: {
        labels:         ['Protein', 'Carbohydrate', 'Total Fat'],
        data:           [0, 0, 0],
        generateLabels: function (chart) {
          var data = chart.data;
          if (data.labels.length && data.datasets.length) {
            return data.labels.map(function (label, i) {
              var meta = chart.getDatasetMeta(0);
              var ds = data.datasets[0];
              var arc = meta.data[i];
              var custom = arc.custom || {};
              var getValueAtIndexOrDefault = Chart.helpers.getValueAtIndexOrDefault;
              var arcOpts = chart.options.elements.arc;
              var fill = custom.backgroundColor ? custom.backgroundColor : getValueAtIndexOrDefault(ds.backgroundColor, i, arcOpts.backgroundColor);
              var stroke = custom.borderColor ? custom.borderColor : getValueAtIndexOrDefault(ds.borderColor, i, arcOpts.borderColor);
              var bw = custom.borderWidth ? custom.borderWidth : getValueAtIndexOrDefault(ds.borderWidth, i, arcOpts.borderWidth);

              return {
                text:        label + ' ' + ds.data[i] + '%',
                fillStyle:   fill,
                strokeStyle: stroke,
                lineWidth:   bw,
                hidden:      isNaN(ds.data[i]) || meta.data[i].hidden,

                // Extra data used for toggling the correct item
                index: i
              };
            });
          } else {
            return [];
          }
        },
        label:          (tooltipItem, data) => data.labels[tooltipItem.index] + ': ' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] + '%'
      },

      targets:         {},

      nutrientsByDates: {},

      datasetOverride: [
        {
          borderColor: 'red',
          pointRadius: 0,
          fill:        false,
          type:        'line'
        },
        {
          type: 'bar'
        }
      ]
    };

    let me = nixTrackApiClient.me().success(me => {
      vm.me = me;

      vm.report.targets[nixTrackApiClient.calories_nutrient] = me.daily_kcal;
    });

    vm.dateRange = {
      begin: ($state.params.begin ?
        moment($state.params.begin) :
        moment($state.params.end || undefined)
          .add(1, 'day')
          .startOf('day')
          .subtract(7, 'days')),
      end: ($state.params.end ? moment($state.params.end) : moment())
             .add(1, 'day')
             .startOf('day')
    };

    vm.dateRange.daysCount = Math.ceil(vm.dateRange.end.diff(vm.dateRange.begin, 'days', true));
    vm.dateRange.displayEnd = vm.dateRange.end.clone().subtract(1, 'day');


    vm.daysTracked = null;

    nixTrackApiClient.log.get({
      timezone: moment.tz.guess() || "US/Eastern",
      begin:    vm.dateRange.begin.format('YYYY-MM-DD'),
      end:      vm.dateRange.end.format('YYYY-MM-DD'),
      limit:    500
    }).success(log => {
      vm.log = log;


      vm.daysTracked = _.uniq(log.foods.map(food => moment(food.consumed_at).format('YYYY-MM-DD'))).length;

      angular.forEach(log.foods, function (food) {
        let date = moment(food.consumed_at).format('YYYY-MM-DD');

        if (angular.isUndefined(vm.report.nutrientsByDates[date])) {
          vm.report.nutrientsByDates[date] = {
            calories: 0,
            carbs:    0,
            protein:  0,
            sodium:   0
          };
        }

        vm.report.nutrientsByDates[date].calories += food.nf_calories || 0;
        vm.report.nutrientsByDates[date].carbs += food.nf_total_carbohydrate || 0;
        vm.report.nutrientsByDates[date].protein += food.nf_protein || 0;
        vm.report.nutrientsByDates[date].sodium += food.nf_sodium || 0;

        if (!food.full_nutrients) {
          food.full_nutrients = nutritionixApiDataUtilities.buildFullNutrientsArray(food);
        }
      });

      vm.report.caloriesDates = _.keys(vm.report.nutrientsByDates).sort();
      vm.report.caloriesGoalSuccessDays = vm.report.caloriesDates.reduce(
        (total, date) => total + (
          vm.report.nutrientsByDates[date].calories <= vm.report.targets[nixTrackApiClient.calories_nutrient] ? 1 : 0
        ),
        0
      );

      for (let i = 0; i < vm.dateRange.daysCount; i += 1) {
        let day = vm.dateRange.begin.clone().add(i, 'day');
        let date = day.format('YYYY-MM-DD');
        vm.report.chartLabels.push(day.format('M/D'));

        if (vm.report.nutrientsByDates[date]) {
          vm.report.caloriesChart.data[1].push($filter('fdaRound')(vm.report.nutrientsByDates[date].calories, 'calories'));
          vm.report.carbsChart.data[0].push($filter('fdaRound')(vm.report.nutrientsByDates[date].carbs, 'total_carb'));
          vm.report.proteinChart.data[0].push($filter('fdaRound')(vm.report.nutrientsByDates[date].protein, 'protein'));
          vm.report.sodiumChart.data[0].push($filter('fdaRound')(vm.report.nutrientsByDates[date].sodium, 'sodium'));
        } else {
          vm.report.caloriesChart.data[1].push(null);
          vm.report.carbsChart.data[0].push(null);
          vm.report.proteinChart.data[0].push(null);
          vm.report.sodiumChart.data[0].push(null);
        }

        vm.report.caloriesChart.data[0].push(vm.report.targets[nixTrackApiClient.calories_nutrient]);

      }

      // daily average label

      vm.report.total = nixTrackUtils.sumFoods(log.foods);

      vm.report.pieChart.data[0] = _.round(vm.report.total.nf_protein * 4 / vm.report.total.nf_calories * 100, 0);
      vm.report.pieChart.data[1] = _.round(vm.report.total.nf_total_carbohydrate * 4 / vm.report.total.nf_calories * 100, 0);
      vm.report.pieChart.data[2] = _.round(vm.report.total.nf_total_fat * 9 / vm.report.total.nf_calories * 100, 0);

      vm.report.average = nixTrackUtils.multiplyFoodNutrients(
        vm.report.total,
        1 / vm.report.caloriesDates.length,
        true
      );

      vm.report.label = $filter('trackFoodToLabelData')(
        vm.report.average,
        {
          itemName:                      'Daily Average',
          brand_name:                     'Nutritionix',
          showAmountPerServing:           false,
          showItemName:                   false,
          showServingUnitQuantity:        false,
          showServingUnitQuantityTextbox: false

        }
      );
    });

    me.success(me => {
      $http.get(`/reports/foods-to-limit/${me.id}`, {
          params: {
            begin:    vm.dateRange.begin.format('YYYY-MM-DD'),
            end:      vm.dateRange.end.format('YYYY-MM-DD'),
            timezone: moment.tz.guess() || "US/Eastern"
          }
        })
        .success(foods => {vm.report.foodsToLimit = foods;})
    });


    // sorry for this :(
    // TODO: hide this inside directive

    $timeout(() => {
      $('.chart-wrapper').each((index, wrapper) => {
        $scope.$watch(
          () => {
            let canvas = $(wrapper).find('.canvas-graph canvas')[0];
            return canvas ? canvas.toDataURL() : null;
          },
          (dataUrl) => {
            if (dataUrl) {
              $(wrapper).find('.img-graph img').attr('src', dataUrl);

              $(wrapper).find('.img-graph chart-legend').remove();
              $(wrapper).find('.img-graph .chart-container').append($('.canvas-graph chart-legend').clone());

              $(wrapper).find('.img-graph span').each((index, span) => {
                $(span).attr('style', 'background-color: ' + $(span).css('background-color') + ' !important');
              });
            }
          }
        );
      });
    });
  }
})();
