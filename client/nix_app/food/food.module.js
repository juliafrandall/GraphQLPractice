(function () {
  'use strict';

  angular
    .module('food', ['ja.qr'])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider
      .state('site.food', {
        url:         '/food/{raw:raw}/:natural_query/:serving',
        params:      {
          raw:     {value: null, squash: true},
          serving: {value: null, squash: true}
        },
        metaTags:    {
          title:       'Calories in {{item.display_name}}',
          description: 'Calories and other nutrition information for {{item.display_name}}',
          properties:  {}
        },
        templateUrl: baseUrl + '/nix_app/food/food.html',
        controller:  'foodCtrl as vm',
        resolve:     {
          item: function (nixTrackApiClient, $stateParams, $filter) {
            if (!$stateParams.natural_query) {
              return null;
            }
            let query = $stateParams.natural_query;
            if ($stateParams.serving) {
              let serving = $stateParams.serving.split('-')
                .filter(word => word.length === 1 || query.indexOf(word) === -1)
                .join('-');
              query       = `${serving} ${query}`;
            }

            return nixTrackApiClient.natural.nutrients({
                query:             query.replace(/-/g, ' '),
                include_subrecipe: true,
                use_raw_foods:     !!$stateParams.raw,
                line_delimited:    true
              })
              .then(response => {
                let food = response.data.foods[0];
                if (food) {
                  food.display_name = $filter('ucwords')(food.metadata.original_input);

                  if (food.sub_recipe) {
                    const subRecipeWeight = food.sub_recipe.reduce((total, subFood) => total + subFood.serving_weight, 0);
                    const factor          = food.serving_weight_grams / subRecipeWeight;

                    food.sub_recipe.forEach(subFood => {
                      subFood.calories       = subFood.calories * factor;
                      subFood.serving_weight = subFood.serving_weight * factor;
                      subFood.serving_qty    = subFood.serving_qty * factor;
                    });
                  }

                  return food;
                }
              })
              .catch(function () {
                return null;
              });
          }
        },
        onEnter:     function ($anchorScroll) {
          $anchorScroll();
        },
        data:        {
          cssClass: 'page-detail'
        }
      });
  }
})();
