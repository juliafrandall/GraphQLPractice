(function () {
  'use strict';

  angular
    .module('account.recipes')
    .controller('AccountSaveRecipeCtrl', AccountSaveRecipeCtrl);

  function AccountSaveRecipeCtrl($scope, ServicesFactory, $modal, user,
                                 nixTrackApiClient, nixTrackUtils, suggestFoods, recipe,
                                 $q, InstantSmartSearch, $filter, debounce,
                                 globalAlert, $state, reviewFoodsBasket, confirm,
                                 $sessionStorage, $timeout, $http, navigationGuard, $httpParamSerializer) {
    const vm = $scope.vm = this;
    const topMicronutrients  = [305, 262];
    const skipMicronutrients = nixTrackApiClient.macronutrients.concat(topMicronutrients);

    if (!user.get('grocery_agent')) {
      if (recipe) {
        $state.go('site.recipes.edit', {id: $state.params.id});
      } else {
        $state.go('site.recipes.new');
      }

      return;
    }

    navigationGuard.watch(() => !vm.submit.$enabled, 'You have unsaved work. Leave the page?');

    const recipeAllowedFields = [
      "id", "user_id", "name", "name_std", "ingredients",
      "serving_qty", "serving_unit",
      "directions", "photo", "prep_time_min", "cook_time_min",
      "is_public", "source"
    ];

    const ingredientAllowedFields = [
      "metadata", "food_name", "brand_name", "serving_qty",
      "serving_unit", "serving_weight_grams", "nf_calories", "nf_total_fat",
      "nf_saturated_fat", "nf_cholesterol", "nf_sodium", "nf_total_carbohydrate",
      "nf_dietary_fiber", "nf_sugars", "nf_protein", "nf_potassium",
      "nf_p", "full_nutrients", "nix_brand_name", "nix_brand_id", "nix_item_name", "nix_item_id",
      "upc", "source", "ndb_no", "natural_query_id",
      "tags", "alt_measures", "ingredients", "lat",
      "lng", "share_key", "meal_type", "photo",
      "note", "nf_ingredient_statement"
    ];

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

    vm.cleanRecipe = (recipe, additionalAllowedFields = null) => {
      let fields = recipeAllowedFields.concat(additionalAllowedFields || []);

      let cleaned = _.pick(recipe, fields);

      cleaned.ingredients = (cleaned.ingredients || []).map(i => _.pick(i, ingredientAllowedFields));

      return cleaned;
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
        name:           '',
        ingredients:    [],
        full_nutrients: [],
        serving_unit:   'Serving',
        serving_qty:    1,
        source:         4,
        cook_time_min:  0,
        prep_time_min:  0,
        is_public:      0
      };

    vm.isPublic = vm.recipe.is_public;

    vm.updateTime = attribute => {
      if (!vm.recipe[attribute]) {
        vm.recipe[attribute] = recipe ? recipe[attribute] : 0;
      }
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
        controller:  function ($scope, $modalInstance, parentVm) {
          const vm = $scope.vm = this;
          vm.instantSmartSearch = parentVm.instantSmartSearch;
          vm.form               = "freeform-text";
          vm.freeform           = '';

          $scope.modal = {
            submit: () => {
              vm.$error            = null;
              vm.unrecognisedFoods = null;

              return nixTrackApiClient.natural.nutrients({
                  query:          vm.freeform,
                  line_delimited: true,
                  use_raw_foods:  true
                })
                // this may be used if natural will return original_input for line_delimited: false
                .catch(() => nixTrackApiClient.natural
                  .nutrients({
                    query:          vm.freeform,
                    line_delimited: false,
                    use_raw_foods:  true
                  })
                  .then(response => {
                    response.data.foods.forEach(f => {
                      f.metadata = _.assign(
                        f.metadata || {},
                        {
                          original_input: [
                                            f.tags.quantity === '1.0' ? null : f.tags.quantity,
                                            f.tags.measure,
                                            f.tags.item
                                          ].filter(i => !!i).join(' ')
                        }
                      )
                    });

                    return response;
                  })
                )
                .then(response => {
                  let data = response.data;
                  parentVm.addIngredients(data.foods);
                  vm.freeform = '';

                  if (!(data.errors || []).length) {
                    $modalInstance.close();
                  } else {
                    vm.freeform          = data.errors.map(e => e.original_text).join('\n');
                    vm.unrecognisedFoods = true;
                  }
                })
                .catch(response => {
                  vm.$error = response.data;
                });

            },
            close:  () => {$modalInstance.dismiss()}
          };
        },
        windowClass: 'recipe-add-ingredients-modal',
        templateUrl: ServicesFactory.formatTemplateUrl('/nix_app/account/recipes/modals/addIngredientsModal.html'),
        resolve:     {
          parentVm: () => vm
        }
      });
    };

    vm.overwriteRecipe = function (existingRecipeId) {
      return confirm('Recipe with this name already exists. Do you want to overwrite it?')
        .then(() => {
          return nixTrackApiClient(`/recipe/${existingRecipeId}`, {method: 'DELETE'});
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

    vm.updateIngredient = (ingredient) => {
      vm.submit.disable();

      let originalInput = ingredient.metadata.original_input;

      nixTrackApiClient.natural.nutrients({query: originalInput, line_delimited: true, use_raw_foods: true})
        .then(response => {
          if (ingredient.metadata.original_input === originalInput) {
            let food = response.data.foods[0];

            _.forEach(ingredient, (val, key) => {
              if (key in food) {
                ingredient[key] = food[key];
              }
            });

            ingredient.$error = null;
            vm.generateLabel();
            vm.submit.enable();
          }
        })
        .catch(response => {
          if (ingredient.metadata.original_input === originalInput) {
            ingredient.$error = response.data;
          }
        });
    };

    vm.getIngredientsHasErrors = () => {
      for (let i = 0; i < vm.recipe.ingredients.length; i += 1) {
        if (vm.recipe.ingredients[i].$error) {
          return true;
        }
      }

      return false;
    };

    vm.submit = () => {
      vm.submit.$attempted = true;

      if (vm.form.$invalid || !vm.recipe.ingredients.length) {
        return globalAlert.danger(`Recipe not ${vm.recipe.id ? 'updated' : 'created'}. Please add missing information.`, 2000);
      }

      vm.submit.$error = null;
      vm.submit.$busy  = 1;

      if (!vm.recipe.directions) {
        vm.recipe.directions = null;
      }

      if (!vm.recipe.id) {
        return nixTrackApiClient('/recipe', {
          method: 'POST',
          data:   {recipe: vm.cleanRecipe(vm.recipe)}
        })
          .then(response => {
            delete vm.recipe.ingredients;
            angular.merge(vm.recipe, response.data);
          })
          .then(response => vm.imageUpload.submit())
          .then(() => {
            vm.submit.$busy = 2;
            $state.go(
              'account.cabinet.recipes.edit',
              {id: vm.recipe.id},
              {reload: false, notify: false}
            );

            // due to the model update above, submit watchers would execute by this point,
            // so we want to disable submit again, since no edits were actually made
            vm.submit.disable();

            vm.isPublic = vm.recipe.is_public;
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
          });
      } else {
        return nixTrackApiClient(`/recipe/${vm.recipe.id}`, {
          method: 'PUT',
          data:   {
            recipe: vm.cleanRecipe(vm.recipe)
          }
        })
          .then(response => {
            delete vm.recipe.ingredients;
            angular.extend(vm.recipe, response.data);
            return response;
          })
          .then(response => vm.imageUpload.submit())
          .then(() => {
            vm.submit.disable();
            vm.submit.$busy = 2;

            vm.isPublic = vm.recipe.is_public;
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

    vm.generateLabel = () => {
      if (!vm.recipe || !vm.recipe.ingredients || !vm.recipe.ingredients.length) {
        vm.total = null;
        return;
      }

      vm.recipe.ingredients.forEach(food => {
        nutritionixApiDataUtilities.extendFullNutrientsWithMetaData(food.full_nutrients || []);
      });

      let totalFood = nixTrackUtils.sumFoods(vm.recipe.ingredients);

      vm.deepLink = 'https://nutritionix.app.link/q1?' + $httpParamSerializer({
        a: totalFood.full_nutrients
             .filter(n => [203, 204, 205, 208, 269, 291, 305, 306, 307, 601, 606].indexOf(n.attr_id) > -1)
             .map(n => `${n.attr_id}:${_.round(n.value, 1)}`)
             .join(','),
        n: vm.recipe.name,
        q: vm.recipe.serving_qty,
        u: vm.recipe.serving_unit
      });

      vm.total = $filter('trackFoodToLabelData')(
        totalFood,
        {
          itemName:       vm.recipe.name,
          showDisclaimer: false,
          micronutrients: []
        },
        vm.recipe.serving_qty
      );

      _.forEach(topMicronutrients, function (nutrientId) {
        let nutrient = $filter('nutrient')(vm.total.full_nutrients, nutrientId);
        if (nutrient) {
          vm.total.micronutrients.push(nutrient);
        }
      });

      _.forEach(vm.total.full_nutrients, function (nutrient) {
        if (_.indexOf(skipMicronutrients, nutrient.attr_id) === -1) {
          vm.total.micronutrients.push(nutrient);
        }
      });

    };

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
        .then(() => nixTrackApiClient(`/recipe/${vm.recipe.id}`, {method: 'DELETE'}))
        .then(() => $state.go('account.cabinet.recipes.list'));
    };

    vm.copyRecipe = () => {
      vm.recipe.id        = undefined;
      vm.recipe.is_public = 0;

      $state.go('account.cabinet.recipes.new', {}, {reload: false, notify: false});
      vm.focusFoodName = true;
      $timeout(() => vm.focusFoodName = false, 100);
    };

    vm.imageUpload = {
      file:         null,
      backupFile:   null,
      invalidFile:  null,
      clear:        function () {
        this.file        = null;
        this.backupFile  = null;
        this.invalidFile = null;
      },
      onChange:     function () {
        let submit = true;

        if (!this.file && this.backupFile) {
          this.file = this.backupFile;
          submit    = false;
        }

        if (this.file) {
          if (vm.recipe.id && submit) {
            this.submit();
          } else {
            vm.submit.enable();
          }
        }
      },
      submit:       function () {
        if (!this.file) { return $q.resolve(null); }

        vm.submit.$busy      = '1.1';
        vm.imageUpload.$error = null;

        return $http({
          url:     nixTrackApiClient.getApiEndpoint(true) + `/upload/image/recipes/${vm.recipe.id}`,
          method:  'POST',
          headers: {
            'Content-Type': this.file.type,
            'x-user-jwt':   user.get('jwt')
          },
          data:    this.file
        })
          .then(response => {
            vm.recipe.photo.thumb   = response.data.cdn.thumb;
            vm.recipe.photo.highres = response.data.cdn.full;

            this.clear();

            return nixTrackApiClient(`/recipe/${vm.recipe.id}`, {
              method: 'PUT',
              data:   {
                recipe: _.pick(vm.recipe, 'photo')
              }
            });
          })
          .catch(error => {
            this.clear();
            vm.imageUpload.$error = error;
          })
          .finally(() => {
            $timeout(() => vm.submit.$busy = false, 1000)
          });
      },
      beforeChange: function () {
        if (this.file) {
          this.backupFile = this.file;
        }
      }
    };

    vm.deletePhoto = () => {
      confirm('Are you sure you want to delete this image?')
        .then(() => {
          vm.recipe.photo = null;
          vm.imageUpload.clear();
          vm.submit(true);
        });
    };

    vm.pieChart = {
      showAlcohol:    false,
      totalCal:       0,
      labels:         ['Protein', 'Carbohydrate', 'Fat'],
      data:           [],
      normaliseData:  function () {
        let pieSum = _.sum(this.data);

        if (pieSum > 100) {
          this.data[this.data.indexOf(_.max(this.data))] -= pieSum - 100;
        }
      },
      generateLabels: function (chart) {
        // and this is how you alight labels to the bottom left instead of the bottom center when there is no such option. Neat, right ;)
        chart.legend.afterFit = function () {
          _.fill(this.lineWidths, this.width);
        };

        let data = chart.data;
        if (data.labels.length && data.datasets.length) {
          return data.labels.map(function (label, i) {
            let meta                     = chart.getDatasetMeta(0);
            let ds                       = data.datasets[0];
            let arc                      = meta.data[i];
            let custom                   = arc.custom || {};
            let getValueAtIndexOrDefault = Chart.helpers.getValueAtIndexOrDefault;
            let arcOpts                  = chart.options.elements.arc;
            let fill                     = custom.backgroundColor ? custom.backgroundColor : getValueAtIndexOrDefault(ds.backgroundColor, i, arcOpts.backgroundColor);
            let stroke                   = custom.borderColor ? custom.borderColor : getValueAtIndexOrDefault(ds.borderColor, i, arcOpts.borderColor);
            let bw                       = custom.borderWidth ? custom.borderWidth : getValueAtIndexOrDefault(ds.borderWidth, i, arcOpts.borderWidth);

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
      label:          (tooltipItem, data) => data.labels[tooltipItem.index] + ': ' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] + '%',
      calculate:      function () {
        if (vm.recipe.ingredients.length) {
          const total = nixTrackUtils.sumFoods(vm.recipe.ingredients);

          total.alcohol = $filter('nutrient')(vm.recipe.full_nutrients, 221, 'value') || 0;

          this.totalCal = _.max([
            total.nf_calories,
            total.nf_protein * 4 + total.nf_total_carbohydrate * 4 + total.nf_total_fat * 9 + total.alcohol * 7
          ]);

          this.data[0] = _.round(total.nf_protein * 4 / this.totalCal * 100, 0);
          this.data[1] = _.round(total.nf_total_carbohydrate * 4 / this.totalCal * 100, 0);
          this.data[2] = _.round(total.nf_total_fat * 9 / this.totalCal * 100, 0);

          this.estimateAlcohol(total);
          this.normaliseData();
        } else {
          this.data[0] = 0;
          this.data[1] = 0;
          this.data[2] = 0;
        }
      },

      estimateAlcohol: function (data) {
        let alcoholPercentage;
        if (data.alcohol) {
          alcoholPercentage = _.round(data.alcohol * 7 / this.totalCal * 100, 0);
        } else {
          let totalCalPercentage = _.sum(this.data);

          if (totalCalPercentage <= 85) {
            alcoholPercentage = 100 - totalCalPercentage;
          }
        }

        if (alcoholPercentage) {
          this.labels[3]   = 'Alcohol*';
          this.data[3]     = alcoholPercentage;
          this.showAlcohol = true;
        } else {
          this.labels.splice(3, 1);
          this.data.splice(3, 1);
          this.showAlcohol = false;
        }
      },
    };

    // watchers should go at the end

    $scope.$watchCollection('vm.recipe.ingredients', () => {
      vm.generateLabel();
      vm.pieChart.calculate();
    });
    $scope.$watchGroup(['vm.recipe.serving_qty', 'vm.recipe.serving_unit'], vm.generateLabel);

    $scope.$watchGroup(
      [
        'vm.recipe.serving_qty',
        'vm.recipe.serving_unit',
        'vm.recipe.name',
        'vm.recipe.prep_time_min',
        'vm.recipe.cook_time_min',
        'vm.recipe.is_public',
        'vm.recipe.directions'
      ],
      (newValue, oldValue) => {
        if (newValue.join() !== oldValue.join()) {
          vm.submit.enable()
        }
      }
    );
  }
})();
