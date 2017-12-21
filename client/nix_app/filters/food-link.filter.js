(function () {
  'use strict';

  angular
    .module('nutritionix')
    .filter('foodLink', function ($state, $filter) {
      return function foodLink(food) {
        const params = {
          raw:           food.metadata.is_raw_food ? 'raw' : null,
          natural_query: $filter('cleanurl')(food.food_name)
        };

        if (food.metadata.original_input) {
          params.natural_query = food.metadata.original_input;
        } else {
          params.natural_query = $filter('cleanurl')(food.original_food_name || food.food_name);
          if (food.$measure) {
            params.serving = `${food.$measure.qty} ${food.$measure.measure || ''}`.trim();
          } else if (food.tags) {
            params.serving = `${food.tags.quantity.replace(/\.0$/, '')} ${food.tags.measure || ''}`.trim();
          } else {
            params.serving = null;
          }

          if (params.serving === '1') {
            params.serving = null;
          }
        }

        return $state.href('site.food', params);
      }
    });

}());
