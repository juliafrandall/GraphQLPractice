(function () {
  'use strict';

  angular
    .module('track-widget')
    .controller('TrackWidgetCtrl', TrackWidgetCtrl);

  function TrackWidgetCtrl($scope, $location, nixTrackApiClient,
                           nixTrackUtils, $window, user, $filter, food,
                           $modalInstance) {
    var vm = this;

    vm.food = food || $location.search();

    if ($filter('isEmptyObject')(vm.food)) {
      vm.food = user.location;
    }

    food = vm.food;

    food.serving_qty = +(food.serving_qty || 1);
    if (!food.serving_unit) {
      food.serving_unit = 'serving';
    }

    vm.multipleMeasures = vm.food.alt_measures && vm.food.alt_measures.length > 0;

    function message(text) {
      $window.parent.postMessage('track:' + text, '*');
    }

    vm.submit = () => {
      let food = vm.food;

      if (vm.multipleMeasures && vm.measure.serving_weight && vm.food.serving_weight_grams) {
        food = nixTrackUtils.multiplyFoodNutrients(
          food,
          (vm.measure.serving_weight / vm.measure.qty * vm.servingQty) / vm.food.serving_weight_grams
        );

        food.serving_unit = vm.measure.measure;
        food.serving_qty = vm.servingQty;
      } else {
        food = nixTrackUtils.multiplyFoodNutrients(
          food,
          nixTrackUtils.calculateFoodMultiplier(food, vm.servingQty)
        );
      }

      let date = vm.consumedAt.getValue();
      if (date) {
        food.consumed_at = date.format();
      }

      nixTrackApiClient.log.add(food)
        .success(() => { vm.submit.$success = true; })
        .error(() => { vm.submit.$error = true; });
    };

    vm.close = () => {
      if ($modalInstance) {
        $modalInstance.close();
      } else {
        message('popup-closed');
      }
    };

    vm.consumedAt = {
      maxDate:    moment().endOf('day').toDate(),
      now:        moment(),
      useNow:     true,
      meal:       null, //'Dinner'
      day:        'Today',
      datePicker: moment(),
      toggle:     function () {
        this.useNow = !this.useNow;
      },
      getValue:   function (returnNow) {
        if (this.useNow) {
          return returnNow ? this.now : undefined;
        }

        let meal = this.meal || 'Dinner';
        let date;

        if (this.day) {
          date = this.now.clone();
          if (this.day === 'Yesterday') {
            date.subtract(1, 'day');
          }
        } else {
          date = moment(this.datePicker).clone();
        }

        date.startOf('day');

        switch (meal) {
          case 'Breakfast':
            date.hours(8);
            break;
          case 'Lunch':
            date.hours(12);
            break;
          case 'Snack':
            date.hours(14);
            break;
          case 'Dinner':
            date.hours(19);
            break;
        }

        return date;
      }
    };

    $scope.$watch('vm.consumedAt.day', day => {
      vm.consumedAt.showDatePicker = !day;
    });

    if (food.source === 1) {
      food.food_name = food.food_name.replace(/^(.*) - .*$/, '$1');
    }

    // USDA items measures
    if (vm.multipleMeasures) {
      vm.changeMeasure = () => { vm.servingQty = vm.measure.qty };

      if (!food.alt_measures) {
        food.alt_measures = [];
      }

      let originalMeasure = _.find(
        food.alt_measures,
        {
          measure: food.serving_unit,
          qty:     food.serving_qty
        }
      );

      if (originalMeasure) {
        food.alt_measures = _.without(food.alt_measures, originalMeasure);

        food.alt_measures.unshift(originalMeasure);
      } else {
        originalMeasure = {
          serving_weight: food.serving_weight_grams,
          measure:        food.serving_unit,
          seq:            null,
          qty:            food.serving_qty
        };

        food.alt_measures.unshift(originalMeasure);
      }

      food.alt_measures = _.uniq(food.alt_measures, measure => measure.measure);

      if (food.$selectedMeasureInfo) {
        vm.measure = food.$selectedMeasureInfo.measure;
        vm.servingQty = +food.$selectedMeasureInfo.measureQty;
      } else {
        vm.measure = originalMeasure;
        vm.changeMeasure();
      }
    } else {
      vm.servingQty = vm.food.serving_qty;
    }

    vm.getCalories = () => {
      if (food) {
        if (vm.multipleMeasures && vm.measure.serving_weight && food.serving_weight_grams) {
          return food.nf_calories / food.serving_weight_grams *
            (vm.measure.serving_weight / vm.measure.qty * vm.servingQty);
        }

        return food.nf_calories / (food.serving_qty || 1) * vm.servingQty;
      }
    };

    // at this point if user gets to be unauthenticated means he logged out
    // in another window. To simplify handling of this rare case and still prevent
    // errors I'll just be closing track modal
    // related to https://github.com/mattsilvllc/NewSiteDesign/issues/931

    $scope.$watch(() => user.getIsAuthenticated(), authenticated => {
      if (!authenticated) {
        vm.close();
      }
    });
  }
})();
