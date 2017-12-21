(function (undefined) {
  'use strict';

  angular
    .module('account')
    .controller('addFoodModalCtrl', addFoodModalCtrl);

  function addFoodModalCtrl($rootScope, $scope, $modalInstance,
                            $http, nixTrackApiClient, restaurants,
                            $state, $timeout, user, reviewFoodsBasket, consumedAt, moment, recentFoods, InstantSmartSearch) {
    const vm = $scope.vm = this;

    vm.instantSmartSearch = new InstantSmartSearch();

    vm.reviewFoodsBasket = reviewFoodsBasket;

    vm.tabs = [
      {id: 'smart', active: $state.params.tab === 'smart' || !$state.params.tab},
      {id: 'restaurants', active: $state.params.tab === 'restaurants'},
      {id: 'grocery', active: $state.params.tab === 'grocery'},
      {id: 'history', active: $state.params.tab === 'history'}
    ];

    vm.recent = recentFoods;

    vm.setTab = tab => {
      vm.food = null;

      let params      = $state.params;
      let targetState = $state.current.name;
      if (targetState === 'account.cabinet.dashboard') {
        targetState += '.addFood';
      }

      if (tab !== params.tab) {
        params.tab = tab;

        if (tab !== 'restaurants') {
          params.brand_id = null;
          params.q        = null;
        }


        // $state.go(targetState, params);
      }

      if (tab === 'restaurants') {
        if (!vm.restaurant) {
          vm.focus('restaurant');
        } else {
          vm.focus('item');
        }
      } else if (tab === 'smart') {
        vm.focus('smart');
      } else if (tab == 'grocery') {
        vm.focus('groceries');
      }
    };

    vm.getTab = function () {
      for (let i = 0; i < vm.tabs.length; i += 1) {
        if (vm.tabs[i].active) {
          return vm.tabs[i].id;
        }
      }
    };

    vm.groceryItemSelected = undefined;

    vm.restaurantSelected = undefined;
    vm.menuItemSelected   = undefined;
    vm.restaurants        = restaurants;

    vm.consumedAt = consumedAt;
    consumedAt.refresh();

    vm.submit = function (quick) {
      if (quick) {
        vm.submit.smart();
      } else {
        if (vm.food) {
          let date = vm.consumedAt.getValue();
          if (date) {
            vm.food.consumed_at = date.format();
          }

          reviewFoodsBasket.push(vm.food);
          reviewFoodsBasket.openModal();
          vm.food = null;
        } else if (vm.query) {
          nixTrackApiClient.natural.nutrients({query: vm.query, timezone: user.getTimezone()})
            .success(data => {
              reviewFoodsBasket.push(data.foods);

              // the second condition checks whether
              // food's time differs for at least one hour from the current time
              // in that case it means that api parsed some time context in the query
              // and we would like to apply it
              if (Math.abs(data.foods[0].consumed_at && moment().diff(moment(data.foods[0].consumed_at), 'hours')) > 0) {
                vm.consumedAt.setValue(data.foods[0].consumed_at);
              }

              reviewFoodsBasket.openModal();
              vm.close();
            })
            .error(function (error) {
              if (error.message === "We couldn't match any of your foods") {
                vm.notFound = error;
              } else {
                vm.error = error;
              }
            });
        }
      }
    };

    vm.submit.smart = function () {
      vm.notFound = null;
      vm.error    = null;


      if (vm.query) {
        let options = {
          query:    vm.query,
          timezone: user.getTimezone()
        };
        let date    = vm.consumedAt.getValue();
        if (date) {
          options.consumed_at = date.format();
        }

        nixTrackApiClient.natural.add(options)
          .success(()=> {
            $rootScope.$broadcast('track:foods-added');
            $modalInstance.close();
          })
          .error(function (error) {
            if (error.message === "We couldn't match any of your foods") {
              vm.notFound = error;
            } else {
              vm.error = error;
            }
          });
      }
    };

    vm.close = function () {
      $modalInstance.dismiss();
    };

    // vm.textCompleteStrategy = new TextCompleteStrategy();
    // vm.textCompleteStrategy.addSource(
    //   nixTrackApiClient('/me/autocomplete', {params: {source: 1, skip_full_nutrients: 'true'}})
    //     .then(response => response.data.foods
    //       .sort((first, second) => second.ct - first.ct)
    //       .map(food => food.food_name)),
    //   1, 5, true, value => `<b>${value}</b>`
    // );
    // vm.textCompleteStrategy.addSource(
    //   $http.get('//nix-export.s3.amazonaws.com/upc_phrases.json.gz')
    //     .then(response => response.data),
    //   0, 10
    // );

    vm.focus = function (which) {
      vm.focus[which] = true;
      $timeout(() => {vm.focus[which] = false;});
    };

    vm.recentRestaurants = [];

    nixTrackApiClient.log.get({source: 3})
      .success(response => {
        for (let i = 0; i < response.foods.length; i += 1) {
          let food = response.foods[i];

          let restaurant = _.find(restaurants, {name: food.brand_name});
          if (restaurant && vm.recentRestaurants.indexOf(restaurant) === -1) {
            restaurant.lastVisited = food.consumed_at;
            vm.recentRestaurants.push(restaurant);
          }

          if (vm.recentRestaurants.length > 1) { break; }
        }
      });

    vm.selectRestaurant = (restaurant) => {
      vm.restaurant       = restaurant;
      vm.food             = null;
      vm.menuItemSelected = null;
      vm.focus('item');

      // $state.go('account.cabinet.dashboard.addFood.navigate', {brand_id: restaurant.id})
    };

    if ($state.params.brand_id) {
      let restaurant = _.find(restaurants, {id: $state.params.brand_id});
      if (restaurant) {
        vm.restaurantSelected = restaurant.name;
        vm.selectRestaurant(restaurant);
      }
    }

    vm.selectItem = item => {
      vm.food = nutritionixApiDataUtilities.convertV1ItemToTrackFood(item, {source: 3});
    };

    if ($state.params.q) {
      vm.menuItemSelected = $state.params.q;
    }


    vm.getMenus = function (search) {
      return $http
        .get('/nixapi/search', {
          params: {
            page:      1,
            q:         search,
            brand_id:  vm.restaurant.id,
            full_data: true
          }
        })
        .then(response => response.data.hits.map(hit => hit.fields));
    };

    vm.searchGroceryFoods = function (search, offset, limit) {
      return $http
        .post('/nixapi/search', {
          'query':   search,
          'offset':  offset || 0,
          'limit':   limit || 5,
          'sort':    {
            'field': '_score',
            'order': 'desc'
          },
          'filters': {
            'item_type': 2
          }
        })
        .then(response => response.data.hits.map(hit => hit.fields));
    };

    vm.openReviewFoodsBasketModal = () => {
      reviewFoodsBasket.openModal();
      $modalInstance.close();
    };

    vm.history = {
      search:    '',
      viewLimit: 10,
      suggested: null,
      foods:     null,
      refresh:   function () {
        let search = this.search;
        if (search) {
          nixTrackApiClient('/search/instant', {params: {query: search, branded: false, common: false, self: true}})
            .then(response => {
              this.foods = response.data.self;
            })
        } else {
          this.foods = this.suggested;
        }
      },
      add:       function (historyFood) {
        nixTrackApiClient(`/log/${historyFood.id || historyFood.uuid}/detailed`)
          .success(response => {
            reviewFoodsBasket.push(response.foods[0]);
          })
      },
      showMore:  function () {
        this.viewLimit += 10;
      }
    };

    nixTrackApiClient('/reports/suggested')
      .then(response => {
        vm.history.suggested = vm.history.foods = response.data.foods;
      });

    // $scope.$watch('vm.menuItemSelected', search => {
    //   let params = $state.params;
    //   params.q   = search && (angular.isObject(search) ? search.item_name : search) || undefined;
    //   $state.go($state.current.name, params);
    // });

    // bs modal initially takes focus on itself after the animation.
    // So when modal first opens we want to wait before it happens.
    // Afterwards we may gain focus on inputs immediately

    vm.focusDelay = 500;
    $timeout(()=> {vm.focusDelay = 0;});

    $scope.$on('reviewFoodsBasketOpened', () => {vm.close();});
  }
})();
