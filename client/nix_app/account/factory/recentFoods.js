'use strict';

angular.module('account')
  .factory('recentFoods', function (nixTrackApiClient, nixTrackUtils, reviewFoodsBasket, $filter) {
    return {
      menuItemSelected: null,
      allFoods:         [],
      foods:            [],
      type:             '',
      types:            [
        {id: '', name: 'All'},
        {id: 1, name: 'Common'},
        {id: 3, name: 'Restaurant'},
        {id: 2, name: 'Grocery'}
      ],
      load:             function () {
        let options = {
          limit: 100,
                 timezone
        };

        if (this.type) {
          options.source = +this.type;
        }

        nixTrackApiClient.log.get(options)
          .success(log => {
            this.setFoods(log.foods);
          });
      },
      add:              function (food) {
        this.menuItemSelected = null;
        reviewFoodsBasket.push(nixTrackUtils.copyFood(food));
        reviewFoodsBasket.openModal();
      },
      setFoods:         function (foods) {
        this.allFoods = foods;
        this.foods = _.uniq(foods, 'food_name');
      },
      suggest:          function (term, type, limit) {
        let foods = this.foods;
        if (!term) {return [];}

        if (type.id) {
          foods = $filter('filter')(foods, {source: type.id});
        }

        term = term.toLowerCase();

        foods = $filter('filter')(foods, function (food) {
          if (food.food_name && food.food_name.toLowerCase().indexOf(term) > -1) {
            return true;
          }

          if (food.brand_name && food.brand_name.toLowerCase().indexOf(term) > -1) {
            return true;
          }

          return false;
        });

        if (limit) {
          foods = foods.slice(0, limit);
        }

        return foods;
      }
    };
  });
