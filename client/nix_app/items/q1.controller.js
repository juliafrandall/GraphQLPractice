(function () {
  'use strict';

  angular
    .module('items')
    .controller('Q1Ctrl', Q1Ctrl);

  function Q1Ctrl($scope, $location, $timeout, $filter) {
    let vm = $scope.vm = this;

    vm.qrCodeData = $location.absUrl();

    let item = $location.search();

    let nutrients = {};
    (item.a || '').split(',').forEach(nutrientData => {
      let parts           = nutrientData.split(':');
      nutrients[parts[0]] = parts[1];
    });

    vm.item = {
      item_name:    item.n || 'Item',
      brand_name:   item.b || 'Nutritionix',
      serving_qty:  item.q || 1,
      serving_unit: item.u || 'Serving'
    };

    vm.initLabelNutrients = () => {
      let full_nutrients = [];
      angular.forEach(nutrients, (value, attr_id) => {
        full_nutrients.push({
          attr_id: +attr_id,
          value
        })
      });

      vm.labelData = $filter('trackFoodToLabelData')(
        {full_nutrients},
        {
          itemName:                       vm.item.item_name,
          brandName:                      vm.item.brand_name,
          valueServingUnitQuantity:       vm.item.serving_qty,
          valueServingSizeUnit:           vm.item.serving_unit,
          showItemName:                   true,
          showBrandName:                  true,
          showServingUnitQuantity:        true,
          showServingUnitQuantityTextbox: true
        }
      );
    };

    vm.initLabelNutrients();


    vm.quantityChanged = (action, previous, current) => {
      angular.forEach(nutrients, (value, attr_id) => {
        nutrients[attr_id] = nutrients[attr_id] / previous * current;
      });


      if (!angular.isUndefined(current)) {
        vm.item.serving_qty = current;
      }
    };

    $scope.$watchCollection('vm.item', () => {
      let search = {};
      search.n   = vm.item.item_name;
      search.b   = vm.item.brand_name;
      search.q   = vm.item.serving_qty;
      search.u   = vm.item.serving_unit;

      let nutrientsKeyValues = [];
      for (let i in nutrients) if (nutrients.hasOwnProperty(i) && !_.isNaN(nutrients[i])) {
        nutrientsKeyValues.push(
          i.toString() + ':' +
          _.round(nutrients[i], 2).toString().replace(/\.[1-9]*0+$/, '').replace(/\.$/, '')
        );
      }

      search.a = nutrientsKeyValues.join(',');

      $location.search(search);
      vm.qrCodeData = $location.absUrl();

      vm.$updated = false;
      $timeout(() => vm.$updated = true);

      vm.initLabelNutrients();
    });
  }
})();
