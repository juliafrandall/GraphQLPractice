(function () {
  'use strict';

  angular.module('nutritionix')
    .factory('reviewFoodsBasket', function ($modal, $localStorage, nixTrackUtils,
                                            ServicesFactory, $timeout, confirm,
                                            $rootScope, $q, $filter) {
      let reviewFoodsBasket = {
        $modal:                null,
        notification:          null,
        foods:                 [],
        servings:              1,
        mealName:              '',
        multiple:              true,
        photo:                 null,
        notify:                function (event, data, type) {
          let notification = this.notification = {
            event,
            data,
            type: type || 'info'
          };

          $timeout(() => {
            if (notification === this.notification) {
              this.notification = null;
            }
          }, 3000);
        },
        clear:                 function (force) {
          (force ? $q.resolve(true) : confirm('Are you sure you want to clear basket?'))
            .then(() => {
              this.foods    = [];
              this.servings = 1;
              this.photo    = null;
              this.mealName = '';
              this.multiple = true;

              if (this.$modal) {
                this.$modal.dismiss();
              }
            });
        },
        push:                  function (food) {
          let foods = angular.isArray(food) ? food : [food];

          foods.forEach(food => {
            if ((food.$type === 'branded' || food.$type === 'phrase') && food.serving_weight_grams) {
              if (!_.isArray(food.alt_measures)) {
                food.alt_measures = [];
              }

              food.alt_measures.push({
                measure:        "grams",
                qty:            food.serving_weight_grams,
                serving_weight: food.serving_weight_grams,
                seq:            104
              });
            }

            ServicesFactory.normalizeFoodMeasures(food);

            delete food.id;
            this.foods.push(food);
          });

          this.notify('food-added', {quantity: foods.length});
        },
        remove:                function (food) {
          let index = this.foods.indexOf(food);
          if (index > -1) {
            this.foods.splice(index, 1);
            this.notify('food-removed', null, 'warning');
          }

          if (!this.foods.length && this.modal) {
            this.modal.dismiss();
          }
        },
        getNutrientValue:      function (food, nutrientId) {
          if (!food._servingQty) {return food.nf_calories;}

          let measure = food._measure;
          let qty     = food._servingQty;

          let value = $filter('nutrient')(food.full_nutrients, nutrientId, 'value');

          if (!measure) {
            return value / food.serving_qty * qty;
          }

          return value / food.serving_weight_grams * measure.serving_weight / measure.qty * qty;
        },
        getTotalNutrientValue: function (nutrientId) {
          return reviewFoodsBasket.foods.reduce(
            (calories, food) => calories + reviewFoodsBasket.getNutrientValue(food, nutrientId), 0
          );
        },
        openModal:             function (focusSearch = false, mealType = null) {
          this.$modal = $modal.open({
            animation:   false,
            controller:  'reviewFoodModalCtrl',
            size:        'review-food',
            templateUrl: '/nix_app/account/modals/reviewFoodModal.html',
            resolve:     {
              focusSearch: () => focusSearch,
              mealType:    () => mealType
            }
          });

          this.$modal.result.finally(() => this.$modal = null);

          $rootScope.$broadcast('reviewFoodsBasketOpened');

          return this.$modal;
        }
      };

      // compatibility with older format
      if (_.isArray($localStorage.reviewFoodsBasket)) {
        reviewFoodsBasket.foods         = $localStorage.reviewFoodsBasket;
        $localStorage.reviewFoodsBasket = null;
      }

      angular.extend(reviewFoodsBasket, $localStorage.reviewFoodsBasket || {});
      $localStorage.reviewFoodsBasket = reviewFoodsBasket;

      return reviewFoodsBasket;
    })
    .directive('reviewFoodsBasketNotification', function (reviewFoodsBasket, moment, $timeout) {
      let instances = [];

      return {
        restrict: 'AE',
        scope:    {
          showReviewLink: '='
        },
        template: `
          <div class="food-log-note" ng-if="getShow() && notification">
            <div class="alert alert-info track-alert alert-food-log" ng-class="'alert-' + notification.type" role="alert">
              <i class="fa fa-check" aria-hidden="true"></i> &nbsp; {{notification.message}}
              <a href ng-click="basket.openModal()" ng-show="notification.showReviewLink">Review Basket</a>
            </div>
          </div>
        `,
        link:     function (scope /*, element, attributes*/) {
          let id = (Math.random() + 1).toString(36).substring(7) + moment().format();
          instances.push(id);

          scope.basket = reviewFoodsBasket;

          scope.getShow = () => instances[instances.length - 1] === id;

          let notification, cancelTimeout;
          scope.$watch(() => reviewFoodsBasket.notification, (n, previous) => {
            if (cancelTimeout) {$timeout.cancel(cancelTimeout);}

            notification = angular.copy(n);

            scope.notification = null;

            if (notification) {
              if (notification.event === 'food-removed') {
                notification.message        = 'Item removed from basket';
                notification.showReviewLink = false;
              } else if (notification.event === 'food-added') {
                notification.message        = `${notification.data.quantity} Food(s) added to Basket.`;
                notification.showReviewLink = scope.showReviewLink;
              }

              if (previous) {
                cancelTimeout = $timeout(() => {scope.notification = notification}, 250)
              } else {
                scope.notification = notification
              }
            }
          });

          scope.$on('$destroy', () => {
            let index = instances.indexOf(id);
            if (index > -1) {
              instances.splice(index, 1);
            }
          });
        }
      }
    })
    .directive('reviewFoodsBasketButton', function (reviewFoodsBasket) {
      return {
        restrict: 'AE',
        scope:    {
          afterOpen: '&?',
          animation: '=?'
        },
        template: `
          <span class="btn-basket" ng-class="{'btn-basket-empty': !basket.foods.length}" 
                ng-click="openModal();" 
                tooltip="{{basket.foods.length ? ('Basket contains ' + basket.foods.length + ' ' + (basket.foods.length === 1 ? 'Food' : 'Foods')) : 'Your basket is empty'}}">
            <sup ng-show="basket.foods.length">{{basket.foods.length}}</sup>
            <i class="fa fa-2x fa-shopping-basket" aria-hidden="true"></i>
          </span>
        `,
        link:     function (scope /*, element, attributes*/) {
          scope.basket = reviewFoodsBasket;

          scope.openModal = () => {
            if (!scope.basket.foods.length) {return;}

            scope.basket.openModal(scope.animation);

            if (scope.afterOpen) {
              scope.afterOpen();
            }
          }
        }
      }
    })
}());
