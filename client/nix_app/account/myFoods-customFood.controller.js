(function () {
  'use strict';

  angular
    .module('account')
    .controller('MyFoodsCustomFoodCtrl', MyFoodsCustomFoodCtrl);

  function MyFoodsCustomFoodCtrl($scope, $state, nixTrackApiClient, food, reviewFoodsBasket, confirm, globalAlert) {
    const vm = $scope.vm = this;

    if (food) {
      vm.edit = true;

      angular.extend(
        food,
        nutritionixApiDataUtilities.convertFullNutrientsToNfAttributes(food.full_nutrients)
      );

      vm.food = food;
    } else {
      vm.food = {
        food_name:    '',
        source:       9,
        source_key:   null,
        serving_qty:  '1',
        serving_unit: 'Serving',

        nf_calories:           null,
        nf_total_fat:          null,
        nf_saturated_fat:      null,
        nf_cholesterol:        null,
        nf_sodium:             null,
        nf_total_carbohydrate: null,
        nf_dietary_fiber:      null,
        nf_sugars:             null,
        nf_protein:            null,
        nf_p:                  null,
        nf_potassium:          null,
        nf_vitamin_a_dv:       null,
        nf_vitamin_c_dv:       null,
        nf_vitamin_d_dv:       null,
        nf_calcium_dv:         null,
        nf_iron_dv:            null
      };
    }

    vm.submit = () => {
      vm.submit.$error = null;
      vm.submit.$busy  = true;

      let food = _.omit(vm.food, (value, key) => key.substr(-3) === '_dv');

      food.full_nutrients = nutritionixApiDataUtilities.buildFullNutrientsArray(vm.food);

      food = _.pick(food, [
        'food_name', 'source',
        'source_key', 'full_nutrients', 'serving_weight_grams',
        'serving_unit', 'serving_qty', 'ingredients', 'photo'
      ]);

      nixTrackApiClient('/recipes' + (vm.edit ? `/${vm.food.id}` : ''), {
        method: vm.edit ? 'PUT' : 'POST',
        data:   {recipe: food}
      })
        .success(() => {
          globalAlert.info('Custom Food Saved');
          if (!vm.edit) {
            $state.go('account.cabinet.myFoods', {show: 'all'});
          }
        })
        .error(error => {
          vm.submit.$error = error;
        })
        .finally(() => {
          vm.submit.$busy = null;
        });
    };

    vm.addToFoodLog = () => {
      let food            = angular.copy(vm.food);
      food.full_nutrients = nutritionixApiDataUtilities.buildFullNutrientsArray(vm.food);


      reviewFoodsBasket.push(food);
      reviewFoodsBasket
        .openModal()
        .result
        .then(() => {
          $state.go('account.cabinet.dashboard');
        });
    };

    vm.deleteFood = () => {
      confirm('Are you sure you want to delete this food?')
        .then(() => {
          return nixTrackApiClient(`/recipes/${vm.food.id}`, {method: 'DELETE'})
        })
        .then(() => {
          globalAlert.info('Custom Food Deleted');
          $state.go('account.cabinet.myFoods');
        })
    }
  }
})();
