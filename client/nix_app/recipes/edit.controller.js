(function () {
  'use strict';

  angular
    .module('recipes')
    .controller('RecipesEditCtrl', RecipesEditCtrl);

  function RecipesEditCtrl($scope, ServicesFactory, $modal, user, nixTrackApiClient,
                           nixTrackUtils, suggestFoods, recipe, $q, InstantSmartSearch, $filter, debounce,
                           globalAlert, $state, reviewFoodsBasket, confirm, $sessionStorage, $timeout) {
    let vm = $scope.vm = this;

    if (recipe && recipe.id === $sessionStorage.createdRecipe) {
      globalAlert.success('Recipe Created', 2000, {css: {top: '245px'}});
      $sessionStorage.createdRecipe = null;
    }

    vm.user         = user;
    vm.suggestFoods = suggestFoods;

    vm.instantSmartSearch             = new InstantSmartSearch();
    vm.instantSmartSearch.processFood = function (food) {
      vm.addIngredients(food);
    };

    vm.sources = {
      1:  'natural',
      4:  'recipe',
      8:  'api',
      9:  'custom',
      10: 'nix legacy menu',
      11: 'nix legacy modifier'
    };

    vm.recipe = angular.copy(recipe) || {
        user_id:              user.get('id'),
        food_name:            '',
        ingredients:          [],
        full_nutrients:       [],
        serving_weight_grams: 0,
        serving_unit:         'Serving',
        serving_qty:          1
      };


    vm.addIngredients = foods => {
      if (!angular.isArray(foods)) {
        foods = [foods];
      }

      foods.forEach(food => {
        ServicesFactory.normalizeFoodMeasures(food);
      });

      vm.recipe.ingredients = vm.recipe.ingredients.concat(foods);

      vm.recalculateRecipeNutrients();
    };

    vm.removeIngredient = ingredient => {
      vm.recipe.ingredients = _.without(vm.recipe.ingredients, ingredient);

      vm.recalculateRecipeNutrients();
    };

    vm.recalculateRecipeNutrients = () => {
      let ingredients = angular.copy(vm.recipe.ingredients);

      ingredients.forEach(ingredient => {
        if (ingredient._measure) {
          ServicesFactory.changeFoodMeasure(ingredient, ingredient._measure, true);
        }

        if (ingredient._servingQty) {
          ServicesFactory.changeFoodQuantity(ingredient, ingredient._servingQty);
        }
      });

      let sum = nixTrackUtils.sumFoods(vm.recipe.ingredients);

      vm.recipe.full_nutrients       = sum.full_nutrients;
      vm.recipe.serving_weight_grams = sum.serving_weight_grams;

      vm.submit.enable();
    };

    vm.addIngredients.single = (historyFood) => {
      vm.addIngredients.single.$error = null;

      nixTrackApiClient(`/log/${historyFood.id}/detailed`)
        .success(response => {
          vm.addIngredients(response.foods);
        });
    };

    vm.addIngredients.modal = () => {
      $modal.open({
        animation:   true,
        controller:  function ($scope, $modalInstance) {
          $scope.vm = vm;
          vm.form   = "freeform-text";

          $scope.modal = {
            submit: () => {
              vm.addIngredients.modal.$error = null;
              return nixTrackApiClient.natural.nutrients(vm.addIngredients.modal.value)
                .success(response => {
                  vm.addIngredients(response.foods);
                  vm.addIngredients.modal.value = null;
                })
                .success(() => {$modalInstance.close()})
                .error(error => {
                  vm.addIngredients.modal.$error = error;
                });

            },
            close:  () => {$modalInstance.dismiss()}
          };
        },
        templateUrl: ServicesFactory.formatTemplateUrl('/nix_app/recipes/modals/addMultipleIngredientsModal.html')
      });
    };

    vm.addRecipeInstructions = function () {
      $modal.open({
        animation:   true,
        controller:  function ($scope, $modalInstance) {
          $scope.vm    = vm;
          $scope.modal = {
            close:  () => {$modalInstance.dismiss()},
            submit: () => {
              $scope.modal.submit.$error = null;
              nixTrackApiClient(`/recipes/${recipe.id}`, {
                method: 'PUT',
                data:   {recipe: _.pick(vm.recipe, ['directions'])}
              }).then(() => {
                $modalInstance.close();
              }).catch(error => {
                $scope.modal.submit.$error = error;
              });
            }
          };
        },
        templateUrl: ServicesFactory.formatTemplateUrl('/nix_app/recipes/modals/addRecipeInstructions.html')
      });
    };

    vm.overwriteRecipe = function (existingRecipeId) {
      return confirm('Recipe with this name already exists. Do you want to overwrite it?')
        .then(() => {
          return nixTrackApiClient.recipes.delete(existingRecipeId);
        })
        .then(() => {
          return vm.submit(true);
        })
        .catch(result => {
          if (result === 'cancel') {
            vm.focusFoodName = true;
            $timeout(() => vm.focusFoodName = false, 100);
          }
        })
    };

    vm.submit = (recipeOnly) => {
      vm.submit.$error = null;
      vm.submit.$busy  = 1;

      vm.recipe.ingredients.forEach(ingredient => {
        if (ingredient._measure) {
          ServicesFactory.changeFoodMeasure(ingredient, ingredient._measure, true);
        }

        if (ingredient._servingQty) {
          ServicesFactory.changeFoodQuantity(ingredient, ingredient._servingQty);
        }

        if (ingredient.alt_measures && ingredient.alt_measures.length > 1) {
          ingredient._measure = ingredient.alt_measures[0];
        }

        if (!ingredient.ingredients) {
          ingredient.ingredients = [];
        }
      });

      if (!recipe) {
        nixTrackApiClient('/recipes', {
          method: 'POST',
          data:   {recipe: vm.recipe}
        }).then(response => {
          $state.go('site.recipes.edit', {id: response.data.id});
        }).catch(response => {
          if (response.status === 409) {
            return vm.overwriteRecipe(response.data.existing_resource_id);
          } else {
            vm.submit.$error = response.data;
          }
        });
      } else {
        let deletes = [], updates = [], additions = [], flow;

        if (recipeOnly) {
          flow = $q.resolve()
        } else {
          recipe.ingredients.forEach(ingredient => {
            if (!_.find(vm.recipe.ingredients, {id: ingredient.id})) {
              deletes.push({id: ingredient.id});
            }
          });

          if (deletes.length) {
            flow = nixTrackApiClient(`/recipes/${recipe.id}/ingredients`, {
              method: 'DELETE',
              data:   {ingredients: deletes}
            })
          } else {
            flow = $q.resolve(true);
          }


          vm.recipe.ingredients.forEach(ingredient => {
            let i = _.pick(ingredient, [
              'food_name', 'source',
              'source_key', 'full_nutrients', 'serving_weight_grams',
              'serving_unit', 'serving_qty', 'ingredients', 'photo', 'alt_measures'
            ]);

            if (_.find(recipe.ingredients, {id: ingredient.id})) {
              i.id = ingredient.id;
              updates.push(i);
            } else {
              if (ingredient.source === 1) {
                i.source_key = ingredient.ndb_no;
              } else if (!i.source || !i.source_key) {
                i.source     = 9;
                i.source_key = 0;
              }

              additions.push(i);
            }
          });

          if (updates.length) {
            flow = flow.then(() => {
              return nixTrackApiClient(`/recipes/${recipe.id}/ingredients`, {
                method: 'PUT',
                data:   {ingredients: updates}
              })
            })
          }

          if (additions.length) {
            flow = flow.then(() => {
              return nixTrackApiClient(`/recipes/${recipe.id}/ingredients`, {
                method: 'POST',
                data:   {ingredients: additions}
              })
            })
          }
        }

        flow = flow.then(() => {
          return nixTrackApiClient(`/recipes/${recipe.id}`, {
            method: 'PUT',
            data:   {
              recipe: _.pick(vm.recipe, ['food_name', 'serving_weight_grams', 'serving_unit', 'serving_qty', 'directions'])
            }
          });
        });

        flow
          .then(() => {
            vm.submit.disable();
            vm.submit.$busy = 2;
          })
          .catch(response => {
            if (response.status === 409) {
              return vm.overwriteRecipe(response.data.existing_resource_id);
            } else {
              vm.submit.$error = response.data;
              vm.submit.$busy  = 3;
            }
          })
          .finally(() => {
            $timeout(() => vm.submit.$busy = false, 1000)
          })
      }
    };

    vm.submit.enable = () => vm.submit.$enabled = true;
    vm.submit.disable = () => vm.submit.$enabled = false;

    vm.submit.debounced = debounce(vm.submit, 1000);

    vm.changeFoodMeasure = ingredient => {
      ingredient._servingQty = ingredient._measure.qty;

      vm.submit.enable();
    };

    vm.setCurrentMeasure = ingredient => {
      if (!ingredient._measure) {
        ServicesFactory.normalizeFoodMeasures(ingredient);
        ingredient._measure = ingredient.alt_measures[0];
      } else {
        ingredient._measure = _.find(
          ingredient.alt_measures,
          {
            measure: ingredient._measure.measure,
            qty:     ingredient._measure.qty
          }
        );
      }
    };

    vm.getIngredientCalories = function (ingredient) {


      if (!ingredient._servingQty) {return ingredient.nf_calories;}

      let measure = ingredient._measure;
      let qty     = ingredient._servingQty;

      if (!measure) {
        return ingredient.nf_calories / ingredient.serving_qty * qty;
      }

      return ingredient.nf_calories / ingredient.serving_weight_grams * measure.serving_weight / measure.qty * qty;
    };

    vm.getIngredientWeight = function (ingredient) {
      if (!ingredient._servingQty) {return ingredient.serving_weight_grams;}

      let measure = ingredient._measure;
      let qty     = ingredient._servingQty;

      if (!measure) {
        return ingredient.serving_weight_grams / ingredient.serving_qty * qty;
      }

      return measure.serving_weight / measure.qty * qty;
    };

    vm.generateLabel = () => {
      if (!vm.recipe || !vm.recipe.ingredients || !vm.recipe.ingredients.length) {
        vm.total = null;
        return;
      }

      let ingredients = angular.copy(vm.recipe.ingredients);

      ingredients.forEach(ingredient => {
        if (ingredient._measure) {
          ServicesFactory.changeFoodMeasure(ingredient, ingredient._measure, true);
        }

        if (ingredient._servingQty) {
          ServicesFactory.changeFoodQuantity(ingredient, ingredient._servingQty);
        }
      });

      vm.total = $filter('trackFoodToLabelData')(
        nixTrackUtils.sumFoods(ingredients),
        {
          itemName:  vm.recipe.food_name,
          brandName: 'Nutritionix'
        },
        vm.recipe.serving_qty
      );
    };


    $scope.$watchCollection('vm.recipe.ingredients', vm.generateLabel);
    $scope.$watchGroup(['vm.recipe.serving_qty', 'vm.recipe.serving_unit'], vm.generateLabel);

    $scope.$watchGroup(
      ['vm.recipe.serving_qty', 'vm.recipe.serving_unit', 'vm.recipe.food_name'],
      (newValue, oldValue) => {
        if (newValue.join() !== oldValue.join()) {
          vm.submit.enable()
        }
      }
    );

    vm.addToFoodLog = () => {
      let food = angular.copy(_.pick(vm.recipe, [
        'food_name', 'full_nutrients', 'photo',
        'serving_qty', 'serving_unit', 'serving_weight_grams',
        'source', 'source_key'
      ]));

      _.extend(food, nutritionixApiDataUtilities.convertFullNutrientsToNfAttributes(food.full_nutrients));

      if (food.serving_qty !== 1) {
        nixTrackUtils.multiplyFoodNutrients(
          food,
          nixTrackUtils.calculateFoodMultiplier(food, 1),
          true
        )
      }

      reviewFoodsBasket.push(food);
      reviewFoodsBasket
        .openModal()
        .result
        .then(() => {
          $state.go('account.cabinet.dashboard');
        });
    };

    vm.deleteRecipe = () => {
      confirm('Are you sure you want to delete this recipe?')
        .then(() => nixTrackApiClient.recipes.delete(vm.recipe.id))
        .then(() => $state.go('account.cabinet.myFoods'));
    };

  }
})();
