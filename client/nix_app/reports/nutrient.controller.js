(function (undefined) {
  'use strict';

  angular
    .module('about')
    .controller('ReportsNutrientCtrl', ReportsNutrientCtrl);

  function ReportsNutrientCtrl($scope, nixTrackApiClient, $state, moment, $filter, $http) {
    var vm = this;

    function fixFullNutrients(food) {
      _.each(vm.report.nutrientGroups, (group, name) => {
        if (name === 'names') {return;}
        _.each(group, nutrient => {
          if (nutrient.api_name && !$filter('nutrient')(food.full_nutrients, nutrient.id)) {
            food.full_nutrients.push({
              attr_id:  nutrient.id,
              name:     nutrient.name,
              unit:     nutrient.unit,
              usda_tag: nutrient.usda_tag,
              value:    food[nutrient.api_name]
            });
          }
        });
      })
    }

    vm.nixTrackApiClient = nixTrackApiClient;

    vm.report = {
      caloriesChart: {
        data:   [[], []],
        labels: [],
        series: ['Daily Calories', 'Calories Goal']
      },

      targets:         {},
      full_nutrients:  [],
      caloriesByDates: [],
      nutrientGroups:  {
        names:                  {
          1: ['Primary Nutrients', 'Alcohol and Caffeine', 'Lipids'],
          2: ['Vitamins', 'Minerals']
        },
        'Primary Nutrients':    [
          {id: 203, name: 'Protein', api_name: 'nf_protein', usda_tag: 'PROCNT', unit: 'g'},
          {id: 204, name: 'Fat', api_name: 'nf_total_fat', usda_tag: 'FAT', unit: 'g'},
          {id: 205, name: 'Carbohydrate', api_name: 'nf_total_carbohydrate', usda_tag: 'CHOCDF', unit: 'g'},
          {id: 208, name: 'Calories', api_name: 'nf_calories', usda_tag: 'ENERC_KCAL', unit: 'kcal'},
          {id: 269, name: 'Sugars', api_name: 'nf_sugars', usda_tag: 'SUGAR', unit: 'g'},
          {id: 291, name: 'Fiber', api_name: 'nf_dietary_fiber', usda_tag: 'FIBTG', unit: 'g'},
          {id: 307, name: 'Sodium', api_name: 'nf_sodium', usda_tag: 'NA', unit: 'mg'},
          {id: 601, name: 'Cholesterol', api_name: 'nf_cholesterol', usda_tag: 'CHOLE', unit: 'mg'},
          {id: 606, name: 'Saturated fat', api_name: 'nf_saturated_fat', usda_tag: 'FASAT', unit: 'g'}
        ],
        'Alcohol and Caffeine': [
          {id: 221, name: 'Alcohol'},
          {id: 262, name: 'Caffeine'}
        ],
        'Lipids':               [
          {id: 605, name: 'Trans fatty acids'},
          {id: 645, name: 'Monounsaturated fatty acids'},
          {id: 646, name: 'Polyunsaturated fatty acids'}
        ],
        'Vitamins':             [
          {id: 318, name: 'Vitamin A, IU'},
          {id: 323, name: 'Vitamin E (alpha-tocopherol)'},
          {id: 328, name: 'Vitamin D (D2 + D3)'},
          {id: 401, name: 'Vitamin C'},
          {id: 404, name: 'Thiamin (vitamin B1)'},
          {id: 405, name: 'Riboflavin (vitamin B2)'},
          {id: 406, name: 'Niacin (vitamin B3)'},
          {id: 410, name: 'Pantothenic acid (vitmain B5)'},
          {id: 417, name: 'Folate, total'},
          {id: 418, name: 'Vitamin B12'},
          {id: 420, name: 'Vitamin K'}
        ],
        'Minerals':             [
          {id: 301, name: 'Calcium'},
          {id: 303, name: 'Iron'},
          {id: 304, name: 'Magnesium'},
          {id: 305, name: 'Phosphorus', api_name: 'nf_p', usda_tag: 'P', unit: 'mg'},
          {id: 306, name: 'Potassium'}
        ]
      },
      round:           function (value, attr_id) {
        switch (attr_id) {
        case 203:
          return $filter('fdaRound')(value, 'protein');
        case 204:
          return $filter('fdaRound')(value, 'total_fat');
        case 205:
          return $filter('fdaRound')(value, 'total_carb');
        case 208:
          return $filter('fdaRound')(value, 'calories');
        case 269:
          return $filter('fdaRound')(value, 'sugars');
        case 291:
          return $filter('fdaRound')(value, 'fibers');
        case 307:
          return $filter('fdaRound')(value, 'sodium');
        case 601:
          return $filter('fdaRound')(value, 'cholesterol');
        case 606:
          return $filter('fdaRound')(value, 'saturated_fat');
        case 605:
          return $filter('fdaRound')(value, 'trans_fat');
        case 420:
          return value;
        default:
          return value === null ? null : $filter('number')(value, 3);

        }

      }

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
      end:   $state.params.end ?
               moment($state.params.end).endOf('day') :
               moment()
                 .add(1, 'day')
                 .startOf('day')
    };

    vm.dateRange.daysCount = Math.ceil(vm.dateRange.end.diff(vm.dateRange.begin, 'days', true));


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

        if (angular.isUndefined(vm.report.caloriesByDates[date])) {
          vm.report.caloriesByDates[date] = food.nf_calories;
        } else {
          vm.report.caloriesByDates[date] += food.nf_calories;
        }

        fixFullNutrients(food);

        angular.forEach(food.full_nutrients, function (nutrient) {
          var totalNutrient = $filter('nutrient')(vm.report.full_nutrients, nutrient.attr_id);

          if (totalNutrient) {
            totalNutrient.value += nutrient.value;
          } else {
            vm.report.full_nutrients.push(angular.copy(nutrient));
          }
        });
      });

      vm.report.caloriesByDates.dates = _.keys(vm.report.caloriesByDates).sort();
      vm.report.caloriesGoalSuccessDays = vm.report.caloriesByDates.dates.reduce(
        (total, date) => total + (vm.report.caloriesByDates[date] <=
        vm.report.targets[nixTrackApiClient.calories_nutrient] ? 1 : 0),
        0
      );

      for (let i = 0; i < vm.dateRange.daysCount; i += 1) {
        let chart = vm.report.caloriesChart;
        let day = vm.dateRange.begin.clone().add(i, 'day');
        let date = day.format('YYYY-MM-DD');
        chart.labels.push(day.format('M/D'));

        if (vm.report.caloriesByDates[date]) {
          chart.data[0].push(+$filter('fdaRound')(vm.report.caloriesByDates[date], 'calories'));
        } else {
          chart.data[0].push(null);
        }

        chart.data[1].push(vm.report.targets[nixTrackApiClient.calories_nutrient]);

      }
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

    $scope.$watch(
      () => {
        let canvas = $('.canvas-graph canvas')[0];
        return canvas ? canvas.toDataURL() : null;
      },
      (dataUrl) => {
        if (dataUrl) {
          $('.img-graph img').attr('src', dataUrl);

          $('.img-graph chart-legend').remove();
          $('.img-graph .chart-container').append($('.canvas-graph chart-legend').clone());

          $('.img-graph span').each((index, span) => {
            $(span).attr('style', 'background-color: ' + $(span).css('background-color') + ' !important');
          });
        }
      }
    );
  }
})();
