(function () {
  'use strict';

  angular
    .module('account')
    .controller('reviewFoodModalCtrl', reviewFoodModalCtrl);

  function reviewFoodModalCtrl($rootScope, $scope, nixTrackApiClient,
                               reviewFoodsBasket, ServicesFactory, $modal,
                               $modalInstance, nixTrackUtils, consumedAt,
                               InstantSmartSearch, user, focusSearch, mealType,
                               $q, ImageUpload, moment, $timeout) {
    let vm = $scope.vm = this;

    vm.primaryNutrients = {
      208: {id: 208, name: 'Calories', shortName: 'Cal', unit: 'kcal', round: 'calories'},
      205: {id: 205, name: 'Carbs', unit: 'g', round: 'total_carb'},
      307: {id: 307, name: 'Sodium', unit: 'mg', round: 'sodium'},
      203: {id: 203, name: 'Protein', unit: 'g', round: 'protein'}
    };

    vm.user = user.getUserProfile();

    vm.reviewFoodsBasket = reviewFoodsBasket;

    vm.focusSearch = focusSearch;

    vm.instantSmartSearch                    = new InstantSmartSearch();
    vm.instantSmartSearch.processFood        = function (food) {
      reviewFoodsBasket.push(food);
    };
    vm.instantSmartSearch.suggestedMealTypes = mealType;

    vm.addFoodModal = function () {
      vm.close();

      $modal.open({
        animation:   false,
        controller:  'addFoodModalCtrl',
        templateUrl: ServicesFactory.formatTemplateUrl('/nix_app/account/modals/addFoodModal.html'),
        resolve:     {
          restaurants: () => []
        }
      }).result.finally(() => {$state.go('account.cabinet.dashboard')});
    };

    vm.changeFoodMeasure = food => {
      food._servingQty = food._measure.qty;
    };

    vm.dismiss = () => {$modalInstance.dismiss();};

    vm.setCurrentMeasure = food => {
      if (!food._measure) {
        food._measure = food.alt_measures[0];
      } else {
        food._measure = _.find(
          food.alt_measures,
          {
            measure: food._measure.measure,
            qty:     food._measure.qty
          }
        );
      }
    };

    vm.submit = () => {
      vm.submit.$error = null;

      if (!reviewFoodsBasket.multiple && (!vm.reviewFoodsBasket.servings || !vm.reviewFoodsBasket.mealName)) {return false;}

      let foods = [];
      reviewFoodsBasket.foods.forEach(basketFood => {
        let food;
        if (basketFood._measure) {
          food = ServicesFactory.changeFoodMeasure(basketFood, basketFood._measure);
        } else {
          food = nixTrackUtils.copyFood(basketFood);
        }

        ServicesFactory.changeFoodQuantity(food, basketFood._servingQty);

        if (!reviewFoodsBasket.multiple) {
          nixTrackUtils.multiplyFoodNutrients(food, 1 / vm.reviewFoodsBasket.servings, true);
        }

        foods.push(food);
      });

      //cleaning foods photo
      foods.forEach(food => {
        if (!food.photo || !food.photo.thumb) {
          food.photo = {thumb: 'https://d2eawub7utcl6.cloudfront.net/images/nix-apple-grey.png'}
        }

        if (food.metadata && food.metadata.photo && food.metadata.photo.thumbnail) {
          if (food.photo.thumb.indexOf('nix-apple-grey') > -1) {
            food.photo.thumb = food.metadata.photo.thumbnail;
          }

          delete food.metadata.photo;
        }

        if (reviewFoodsBasket.photo) {
          food.photo = reviewFoodsBasket.photo;
        }
      });

      let options = {
        foods: nixTrackUtils.cleanFoods(foods)
      };

      if (!reviewFoodsBasket.multiple) {
        options.aggregate = vm.reviewFoodsBasket.mealName;
        if (reviewFoodsBasket.photo) {
          options.aggregate_photo = reviewFoodsBasket.photo;
        }
      }

      let date = vm.consumedAt.getValue();
      if (date) {
        options.consumed_at = date.format();
        options.meal_type   = consumedAt.getMealType();
      }

      nixTrackApiClient('/log', {
        method: 'POST',
        data:   options
      })
        .success(() => {
          $rootScope.$broadcast('track:foods-added');
          $modalInstance.close();
          reviewFoodsBasket.clear(true);
        })
        .error(error => {
          vm.submit.$error = error;
        })
    };

    vm.close = function () {
      $modalInstance.dismiss();
    };

    vm.imageUpload                = new ImageUpload('foods');
    vm.imageUpload.submitOnChange = true;
    vm.imageUpload.submit         = function () {
      this.$busy = true;

      return this._submit((vm.consumedAt.getValue() || moment()).format('YYYY-MM-DD'))
        .then(urls => {
          if (urls) {
            reviewFoodsBasket.photo = {
              thumb:            urls.cdn.thumb,
              highres:          urls.cdn.full,
              is_user_uploaded: true
            };
          }
        })
        .finally(() => {
          this.clearUpload();
          $timeout(() => this.$busy = false, 1000)
        });
    };
    vm.clearImageUpload           = () => {
      vm.imageUpload.clear();
      reviewFoodsBasket.photo = null;
    };

    vm.consumedAt = consumedAt;
    consumedAt.refresh();

    vm.openFoodInfoModal = function (food) {
      $modalInstance.close();

      $modal.open({
        animation:   false,
        controller:  'foodInfoModalCtrl',
        size:        'md',
        templateUrl: ServicesFactory.formatTemplateUrl('/nix_app/account/modals/foodInfoModal.html'),
        resolve:     {
          goBack: () => () => reviewFoodsBasket.openModal(),
          food:   () => {
            let measure    = food._measure;
            let servingQty = food._servingQty;

            if (measure) {
              food = ServicesFactory.changeFoodMeasure(food, measure);
            }

            if (servingQty) {
              ServicesFactory.changeFoodQuantity(food, servingQty);
            }

            return food;
          }
        }
      });
    };
  }
}());
