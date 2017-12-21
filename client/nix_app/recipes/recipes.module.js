(function () {
  'use strict';

  angular
    .module('recipes', ['nutritionix.pinterest'])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('site.recipes', {
      abstract: true,
      url:      '/recipes',
      template: '<div ui-view></div>',
      data:     {requiresLogin: true},
      onEnter:  function (forceHttps) {
        forceHttps();
      }
    });

    $stateProvider.state('site.recipes.new', {
      url:         '/new',
      templateUrl: baseUrl + '/nix_app/recipes/create.html',
      controller:  'RecipesNewCtrl',
      data:        {
        requiresLogin: true,
      },
      onEnter:     function ($anchorScroll) {
        $anchorScroll();
      }
    });

    $stateProvider.state('site.recipes.create', {
      url:         '/create',
      templateUrl: baseUrl + '/nix_app/recipes/edit.html',
      controller:  'RecipesEditCtrl',
      data:        {
        requiresLogin: true,
      },
      resolve:     {
        recipe: () => null
      }
    });

    $stateProvider.state('site.recipes.edit', {
      url:         '/edit/:id',
      templateUrl: baseUrl + '/nix_app/recipes/edit.html',
      controller:  'RecipesEditCtrl',
      data:        {
        requiresLogin: true,
      },
      resolve:     {
        recipe: function (nixTrackApiClient, $stateParams) {
          let recipe;

          return nixTrackApiClient.recipes.get($stateParams.id)
            .then(response => {
              recipe = response.data;

              [recipe].concat(recipe.ingredients).forEach(food => {
                angular.extend(food, nutritionixApiDataUtilities.convertFullNutrientsToNfAttributes(food.full_nutrients));
              });

              return recipe;
            })
            .then(recipe => {
              if (recipe.is_public) {
                return nixTrackApiClient(`/recipes/public/id/${recipe.id}`)
                  .then(response => {
                    recipe.public_id = response.data.shortId;
                  })
              }
            })
            .then(() => recipe);
        }
      }
    });

    // NEW Recipe Lists
    $stateProvider.state('site.recipes.list', {
      url:         '',
      templateUrl: baseUrl + '/nix_app/recipes/recipes.html',
    });

    // NEW View Recipe
    $stateProvider.state('site.recipes.view', {
      url:         '/view/:id',
      metaTags:    {
        title:       '{{recipe.food_name}}',
        description: '{{recipe.food_name}}'
      },
      controller:  'RecipesViewCtrl',
      templateUrl: baseUrl + '/nix_app/recipes/view.html',
      data:        {
        cssClass: 'page-detail'
      },
      resolve:     {
        recipe: function (nixTrackApiClient, $stateParams) {
          return nixTrackApiClient.recipes.get($stateParams.id)
            .then(response => {
              let recipe = response.data;

              [recipe].concat(recipe.ingredients).forEach(food => {
                angular.extend(food, nutritionixApiDataUtilities.convertFullNutrientsToNfAttributes(food.full_nutrients));
              });

              return recipe;
            })
        }
      }
    });
  }
})();
