(function () {
  'use strict';

  angular
    .module('list')
    .controller('ListDetailCtrl', ListDetailCtrl);

  function ListDetailCtrl($scope, list, listFocusNutrients, user, nixTrackUtils, $state, $filter) {
    const vm = $scope.vm = this;
    vm.list = list;
    vm.user = user.getUserProfile();

    vm.nutrients = listFocusNutrients;
    vm.nutrientDefinitions = nutritionixApiDataUtilities.fullNutrientsDefinitions;

    vm.list.items.forEach(item => {
      if (item.$measure && item.serving_weight_grams && _.round(item.serving_weight_grams) !== _.round(item.$measure.serving_weight)) {
        const factor = item.$measure.serving_weight / item.serving_weight_grams;

        nixTrackUtils.multiplyFoodNutrients(item, factor, true);
        item.serving_unit = item.$measure.measure;
        item.serving_qty  = item.$measure.qty;
      }
    });

    vm.getItemLink = item => {
      if (item.nix_item_id) {
        return $state.href('site.itemsDetail', {
          brand:     $filter('cleanurl')(item.nix_brand_name),
          item_name: $filter('cleanurl')(item.original_food_name || item.food_name),
          item_id:   item.nix_item_id
        })
      }

      let serving;

      if (item.$measure.measure === 'grams') {
        serving = `${item.$measure.qty} g`
      }

      return $state.href('site.food', {
        natural_query: $filter('cleanurl')(item.original_food_name || item.food_name),
        serving:       serving ? $filter('cleanurl')(serving) : null
      });
    };
  }
})();
