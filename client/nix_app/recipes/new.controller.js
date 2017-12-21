(function () {
  'use strict';

  angular
    .module('recipes')
    .controller('RecipesNewCtrl', RecipesNewCtrl);

  function RecipesNewCtrl($scope, nixTrackApiClient, $sessionStorage, $state) {
    let vm = $scope.vm = this;

    vm.recipe = {
      food_name:    '',
      ingredients:  '',
      serving_qty:  1,
      serving_unit: 'Serving',
      source:       4,
      source_key:   null
    };

    vm.submit = () => {
      vm.submit.$busy = true;
      vm.submit.$error = null;

      nixTrackApiClient('/recipes', {
        method: 'POST',
        data:   {recipe: vm.recipe},
      })
        .success(recipe => {
          $sessionStorage.createdRecipe = recipe.id;
          $state.go('site.recipes.edit', {id: recipe.id});
        })
        .error(error => {
          vm.submit.$error = error;
          if(vm.submit.$error.message === 'resource already exists') {
            vm.submit.$error.message = 'A recipe already exists with this name. Please choose a new name for this recipe.';
          }
        })
        .finally(() => {
          vm.submit.$busy = false;
        })
    }

  }
})();
