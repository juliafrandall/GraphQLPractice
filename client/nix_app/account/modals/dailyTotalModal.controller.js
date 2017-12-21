(function () {
  'use strict';

  angular
    .module('account')
    .controller('dailyTotalModalCtrl', dailyTotalModalCtrl);

  function dailyTotalModalCtrl($rootScope, $scope, $modalInstance, $filter, nixTrackUtils, nixTrackApiClient,
                               user, foods, mealType, moment, viewDate, goals, totals, parentVm, $timeout) {
    const vm = $scope.vm = this;

    //
    // FUNCTIONS
    //

    vm.user       = user.getUserProfile();
    vm.daily_kcal = goals.daily_kcal;
    vm.goals      = goals;

    vm.notes = totals.notes;

    vm.meals = [
        { label: null, type: null },
        { label: 'Breakfast', type: 1 },
        { label: 'AM Snack', type: 2 },
        { label: 'Lunch', type: 3 },
        { label: 'PM Snack', type: 4 },
        { label: 'Dinner', type: 5 },
        { label: 'Late Snack', type: 6 },
    ];

    let total;

    let mealFoods;
    if(mealType) {
      mealFoods = foods.filter(function (meal) {
        return (meal.meal_type === mealType);
      });
      total     = nixTrackUtils.sumFoods(mealFoods);
    }
    else {
      total = nixTrackUtils.sumFoods(foods);
    }


    vm.modalTitle = mealFoods ? vm.meals[mealType].label + ' - '  + moment(viewDate).format('dddd, MM/DD') : 'Daily Total';

    vm.modalDate = moment(viewDate).format('dddd, MM/DD');

    vm.labelData = $filter('trackFoodToLabelData')(total, {
      showAmountPerServing:           false,
      showItemName:                   false,
      showServingUnitQuantity:        false,
      showServingUnitQuantityTextbox: false,
      showTransFat:                   false,

      phosphorus:         total.nf_p,
      caffeine:           $filter('nutrient')(total.full_nutrients, 262, 'value'),
      vitamin_d:          $filter('nutrient')(total.full_nutrients, 324, 'value'),
      vitamin_e:          $filter('nutrient')(total.full_nutrients, 323, 'value'),
      vitamin_k:          $filter('nutrient')(total.full_nutrients, 430, 'value'),
      thiamine:           $filter('nutrient')(total.full_nutrients, 404, 'value'),
      riboflavin:         $filter('nutrient')(total.full_nutrients, 405, 'value'),
      niacin:             $filter('nutrient')(total.full_nutrients, 406, 'value'),
      pantothenic_acid:   $filter('nutrient')(total.full_nutrients, 410, 'value'),
      vitamin_b6:         $filter('nutrient')(total.full_nutrients, 415, 'value'),
      vitamin_b12:        $filter('nutrient')(total.full_nutrients, 418, 'value'),
      folic_acid:         $filter('nutrient')(total.full_nutrients, 431, 'value'),
      zinc:               $filter('nutrient')(total.full_nutrients, 430, 'value'),
      magnesium:          $filter('nutrient')(total.full_nutrients, 304, 'value')
    });


    vm.labelData.iron_dv = 100 / 18 * vm.labelData.iron_dv;

    vm.netCarbs = total.nf_total_carbohydrate > 0 ? (Math.round((total.nf_total_carbohydrate - total.nf_dietary_fiber) * 100)/100) : 0;

    vm.pieChart = {
      showAlcohol:     false,
      labels:          ['Protein', 'Carbohydrate', 'Fat'],
      data:            [
        _.round(total.nf_protein * 4 / total.nf_calories * 100, 0),
        _.round(total.nf_total_carbohydrate * 4 / total.nf_calories * 100, 0),
        _.round(total.nf_total_fat * 9 / total.nf_calories * 100, 0)
      ],
      normaliseData:   function () {
        let pieSum = _.sum(this.data);

        if (pieSum > 100) {
          this.data[this.data.indexOf(_.max(this.data))] -= pieSum - 100;
        }
      },
      estimateAlcohol: function () {
        let totalCalPercentage = _.sum(this.data);

        if (totalCalPercentage <= 85) {
          this.labels.push('Alcohol*');
          this.data.push(100 - totalCalPercentage);

          this.showAlcohol = true;
        }
      },
      generateLabels:  function (chart) {
        var data = chart.data;
        if (data.labels.length && data.datasets.length) {
          return data.labels.map(function (label, i) {
            let meta = chart.getDatasetMeta(0);
            let ds = data.datasets[0];
            let arc = meta.data[i];
            let custom = arc.custom || {};
            let getValueAtIndexOrDefault = Chart.helpers.getValueAtIndexOrDefault;
            let arcOpts = chart.options.elements.arc;
            let fill = custom.backgroundColor ? custom.backgroundColor : getValueAtIndexOrDefault(ds.backgroundColor, i, arcOpts.backgroundColor);
            let stroke = custom.borderColor ? custom.borderColor : getValueAtIndexOrDefault(ds.borderColor, i, arcOpts.borderColor);
            let bw = custom.borderWidth ? custom.borderWidth : getValueAtIndexOrDefault(ds.borderWidth, i, arcOpts.borderWidth);

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
      label:           (tooltipItem, data) => data.labels[tooltipItem.index] + ': ' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] + '%'
    };

    vm.pieChart.estimateAlcohol();
    vm.pieChart.normaliseData();


    vm.close = function () {
      $modalInstance.dismiss();
    };

    let date = viewDate.format(parentVm.dateFormat);

    vm.saveNotes = () => {
      vm.saveNotes.$error = null;
      vm.saveNotes.$busy  = true;

      let notes = vm.notes || null;

      nixTrackApiClient('/reports/totals', {
        method: 'PUT',
        data:   {dates: [{date, notes}]}
      })
        .then(() => {
          totals.notes = notes;
        })
        .catch(error => {
          vm.saveNotes.$error = error;
        })
        .finally(() => {
          vm.saveNotes.$busy = false;
        })
    };

    vm.saveDailyKCal = () => {
      vm.saveDailyKCal.$error = null;
      vm.saveDailyKCal.$saved = null;
      vm.saveDailyKCal.$busy  = true;

      nixTrackApiClient('/reports/totals', {
        method: 'PUT',
        data:   {dates: [{date, daily_kcal_limit: vm.daily_kcal}]}
      })
        .then(() => {
          if (date === moment().format(parentVm.dateFormat)) {
            return nixTrackApiClient.me.preferences({daily_kcal: vm.daily_kcal})
              .then(response => {
                user.setUserProfile(vm.user = response.data);
              })
          }
        })
        .then(() => {
          $rootScope.$broadcast('track:goals-changed');

          vm.saveDailyKCal.$saved = true;
          $timeout(() => vm.saveDailyKCal.$saved = null, 2000);
        })
        .catch(error => {
          vm.saveDailyKCal.$error = error;
        })
        .finally(() => {
          vm.saveDailyKCal.$busy = false;
        })
    }
  }
})();
