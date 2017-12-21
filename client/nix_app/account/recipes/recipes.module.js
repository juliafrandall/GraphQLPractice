(function () {
  'use strict';

  angular.module('account.recipes', [])
    .config(config);

  function config($stateProvider) {
    $stateProvider
      .state('account.cabinet.recipes', {
        url:      '/my-recipes',
        abstract: true,
        template: '<div ui-view></div>',
        data: {
          cssClass: 'account logged-in recipes'
        }
      })
      .state('account.cabinet.recipes.list', {
        url:         '/list',
        metaTags:    {
          title:       'Recipes',
          description: 'Recipes'
        },
        controller:  'AccountRecipesListCtrl',
        templateUrl: '/nix_app/account/recipes/list.html'
      })
      .state('account.cabinet.recipes.new', {
        url:         '/new',
        controller:  'AccountSaveRecipeCtrl',
        templateUrl: '/nix_app/account/recipes/save.html',
        resolve:     {
          recipe: () => null
        }
      })
      .state('account.cabinet.recipes.edit', {
        url:         '/edit/:id',
        metaTags:    {
          title:       '{{recipe.name | ucwords}} - edit',
          description: '{{recipe.name | ucwords}} - edit'
        },
        controller:  'AccountSaveRecipeCtrl',
        templateUrl: '/nix_app/account/recipes/save.html',
        resolve:     {
          recipe: function (nixTrackApiClient, $stateParams) {
            let recipe;

            return nixTrackApiClient(`/recipe/${$stateParams.id}`)
              .then(response => {
                recipe = response.data;

                [recipe].concat(recipe.ingredients).forEach(food => {
                  angular.extend(food, nutritionixApiDataUtilities.convertFullNutrientsToNfAttributes(food.full_nutrients));
                });

                recipe.ingredients.forEach(ingredient => {
                  if(!ingredient.metadata) {
                    ingredient.metadata = {};
                  }

                  if (!ingredient.metadata.original_input) {
                    ingredient.metadata.original_input = _.uniq(
                      `${ingredient.serving_qty} ${ingredient.serving_unit} ${ingredient.food_name}`
                        .replace(/\(.*?\)/g, '')
                        .replace(/\s+/g, ' ')
                        .split(' ')
                    ).join(' ')
                  }
                });

                ['cook_time_min', 'prep_time_min'].forEach(attribute => !recipe[attribute] && (recipe[attribute] = 0));

                return recipe;
              })
              .then(() => recipe);
          }
        }
      })
      .state('site.recipes.public-view', {
        url:         '^/recipe/:recipe_name/:id',
        metaTags:    {
          title:       '{{recipe.name | ucwords}} recipe and nutrition information',
          description: '{{recipe.name | ucwords}} recipe and nutrition information'
        },
        controller:  'RecipesViewCtrl',
        templateUrl: '/nix_app/recipes/view.html',
        data:        {
          cssClass:      'page-detail',
          requiresLogin: false
        },
        resolve:     {
          recipe: function (nixTrackApiClient, $stateParams, $state, $q) {
            return nixTrackApiClient(`/recipe/${$stateParams.id}`)
              .then(response => {
                let recipe = response.data;

                [recipe].concat(recipe.ingredients).forEach(food => {
                  angular.extend(food, nutritionixApiDataUtilities.convertFullNutrientsToNfAttributes(food.full_nutrients));
                });

                return recipe;
              })
              .catch(response => {
                $state.go(response.status === 404 ? 'site.404' : 'site.50x');
                return $q.reject(response);
              })
          }
        }
      });
  }
}());
