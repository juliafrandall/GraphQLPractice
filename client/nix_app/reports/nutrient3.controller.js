(function (undefined) {
  'use strict';

  angular
    .module('about')
    .controller('ReportsNutrient3Ctrl', ReportsNutrient3Ctrl);

  function ReportsNutrient3Ctrl($scope, nixTrackApiClient, $state, moment, user) {
    var vm = this;

    vm.nixTrackApiClient = nixTrackApiClient;

    vm.primaryNutrients = {
      208: {id: 208, name: 'Cal', unit: 'kcal', round: 'calories'},
      205: {id: 205, name: 'Carbs', unit: 'g', round: 'total_carb'},
      307: {id: 307, name: 'Sodium', unit: 'mg', round: 'sodium'},
      203: {id: 203, name: 'Protein', unit: 'g', round: 'protein'}
    };

    vm.setProgressBarColor = function (totalValue) {
      let className = '';
      if (vm.primaryNutrient) {
        let caloriesPercentage = (totalValue / (vm.primaryNutrient.value) * 100).toFixed(2);

        if (caloriesPercentage >= 95 && caloriesPercentage < 100) {
          className = 'warning';
        }

        if (caloriesPercentage >= 100) {
          className = 'danger';
        }
      }

      return className;
    };

    vm.report = {
      dates:            [],
      nutrientsByDates: {},
      entriesByDates:   {}

    };

    vm.setupPrimaryNutrient = () => {
      if (vm.me.default_nutrient) {
        vm.primaryNutrient = vm.primaryNutrients[vm.me.default_nutrient];
        vm.primaryNutrient.value = vm.me.default_nutrient_value || 2000;
      } else {
        vm.primaryNutrient = vm.primaryNutrients[208];
        vm.primaryNutrient.value = vm.me.daily_kcal || 2000;
      }
    };

    vm.me = user.getIdentity().user;

    vm.setupPrimaryNutrient();

    nixTrackApiClient.me().success(me => {
      vm.me = me;
      vm.setupPrimaryNutrient();
    });

    vm.dateRange = {
      begin: ($state.params.begin ?
        moment($state.params.begin) :
        moment($state.params.end || undefined)
          .add(1, 'day')
          .startOf('day')
          .subtract(7, 'days')),
      end:   ($state.params.end ? moment($state.params.end) : moment())
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
            208: 0, //calories
            205: 0, //carbs
            203: 0, //protein
            307: 0 // sodium
          };
        }

        vm.report.nutrientsByDates[date][208] += food.nf_calories || 0;
        vm.report.nutrientsByDates[date][205] += food.nf_total_carbohydrate || 0;
        vm.report.nutrientsByDates[date][203] += food.nf_protein || 0;
        vm.report.nutrientsByDates[date][307] += food.nf_sodium || 0;

        if (!food.full_nutrients) {
          food.full_nutrients = nutritionixApiDataUtilities.buildFullNutrientsArray(food);
        }

        if (!vm.report.entriesByDates[date]) {
          vm.report.dates.push(date);
          vm.report.entriesByDates[date] = [];
        }

        vm.report.entriesByDates[date].push(food);
      });
    });
  }
})();
