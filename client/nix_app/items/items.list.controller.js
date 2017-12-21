(function () {
  'use strict';

  angular
    .module('items')
    .controller('itemsListCtrl', itemsListCtrl);

  function itemsListCtrl($scope, results, $stateParams, $state, search, naturalResult, restaurantsCalculatorData, $filter) {
    //
    // VARIABLES
    //
    const vm = this;

    vm.showAll = {
      common:  false,
      branded: false
    };

    vm.changeMeasure    = () => {vm.measureQty = vm.measure.qty};
    vm.getSmartFoodLink = () => {
      const params = {
        natural_query: $filter('cleanurl')(vm.naturalResult.food_name)
      };

      let serving = [];

      if (parseFloat(vm.naturalResult.tags.quantity) !== vm.measureQty) {
        serving.push(vm.measureQty);
      }

      if (vm.naturalResult.tags.measure || vm.measure.measure !== vm.naturalResult.serving_unit) {
        serving.push(vm.measure.measure.replace(/\(.*\)/, '').trim());
      }

      params.serving = serving.length ? $filter('cleanurl')(serving.join(' ').trim()) : null;

      return $state.href('site.food', params);
    };

    if (naturalResult) {
      if (!naturalResult.alt_measures) {
        naturalResult.alt_measures = [];
      }

      let originalMeasure = _.find(
        naturalResult.alt_measures,
        {
          measure: naturalResult.serving_unit,
          qty:     naturalResult.serving_qty
        }
      );

      if (originalMeasure) {
        naturalResult.alt_measures = _.without(naturalResult.alt_measures, originalMeasure);

        naturalResult.alt_measures.unshift(originalMeasure);
      } else {
        originalMeasure = {
          serving_weight: naturalResult.serving_weight_grams,
          measure:        naturalResult.serving_unit,
          seq:            null,
          qty:            naturalResult.serving_qty
        };

        naturalResult.alt_measures.unshift(originalMeasure);
      }

      naturalResult.alt_measures = _.uniq(naturalResult.alt_measures, measure => {
        return measure.measure;
      });

      vm.measure = originalMeasure;
      vm.changeMeasure();
    }

    vm.getNaturalCalories = () => {
      if (naturalResult) {
        return naturalResult.nf_calories / naturalResult.serving_weight_grams *
          (vm.measure.serving_weight / vm.measure.qty * vm.measureQty);
      }
    };

    vm.naturalResult = naturalResult;

    vm.results       = results;
    vm.search        = search;
    vm.originalQuery = $stateParams.q;

    if (results.branded.length) {
      let brandIds = _(vm.results.branded.map(item => item.nix_brand_id)).filter().unique().value();

      searchRestaurantBrand: for (let i = 0; i < brandIds.length; i += 1) {
        for (let j = 0; j < restaurantsCalculatorData.length; j += 1) {
          if (restaurantsCalculatorData[j].brand_id === brandIds[i]) {
            vm.calculatorBrand = restaurantsCalculatorData[j];
            break searchRestaurantBrand;
          }
        }
      }
    }

    //
    // FUNCTIONS
    //

    if (vm.naturalResult) {
      let selectedMeasureInfo = vm.naturalResult.$selectedMeasureInfo = {};

      $scope.$watchGroup(['vm.measure', 'vm.measureQty'], () => {
        selectedMeasureInfo.measure = vm.measure;
        selectedMeasureInfo.measureQty = vm.measureQty;
      });
    }
  }
})();
