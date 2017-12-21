(function () {
  'use strict';

  angular
    .module('items', ['ja.qr'])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider
      .state('site.itemsSearch', {
        url: '/search?{q:any}',
        metaTags: {
          title:       `{{searchQuery && 'Search results for "' + searchQuery + '"' || 'Please enter a search query'}}`,
          description: 'Search results for "{{searchQuery || "not provided search term"}}"'
        },
        templateUrl: baseUrl + '/nix_app/items/items.list.html',
        controller: 'itemsListCtrl as vm',
        resolve: {
          results:       function (ItemFactory, $state, $stateParams, $q) {
            if (!$stateParams.q) {
              return $q.resolve(null);
            }
            return ItemFactory.searchItems($stateParams.q)
              .catch(function (response) {
                if (response.status === 400) {
                  $state.go('site.400');
                } else {
                  return null;
                }
              });
          },
          naturalResult: function (nixTrackApiClient, $stateParams) {
            return nixTrackApiClient.natural.nutrients($stateParams.q, true)
              .then(response => {
                if (response.data && response.data.foods && response.data.foods.length === 1) {
                  let food = response.data.foods[0];
                  food.metadata = angular.merge(
                    {photo: {thumbnail: '//d2eawub7utcl6.cloudfront.net/images/nix-apple-grey.png'}},
                    food.metadata || {}
                  );

                  return food;
                }

                return null;
              })
              .catch(response => null);
          },
          searchQuery:   function (search, $stateParams) {
            return search.query || $stateParams.q && $stateParams.q.replace(/\-/g, ' ');
          },
          restaurantsCalculatorData: function(BrandsFactory){
            return BrandsFactory.getRestaurantsCalculatorData();
          }
        },
        onEnter: function ($anchorScroll) {
          $anchorScroll();
        }
      })
      .state('site.itemsDetail', {
        url:         '/i/:brand/:item_name/:item_id?developer',
        metaTags:    {
          title:       '{{("Calories in " + (item.item_name | unescape | characters: 60) + " from " + (item.brand_name | unescape)) | characters: 100}}',
          description: 'Calories and other nutrition information for {{item.item_name | unescape}} from {{item.brand_name | unescape}}',
          properties:  {
            'og:image':      '{{item.brand_logo}}',
            'twitter:image': '{{item.brand_logo}}',
            'productID' : '{{item.item_id}}'
          }
        },
        templateUrl: baseUrl + '/nix_app/items/items.detail.html',
        controller:  'itemsDetailCtrl as vm',
        resolve: {
          item: function (ItemFactory, $stateParams, $state) {
            if (!$stateParams.item_id) {
              return null;
            }
            return ItemFactory.searchItemById($stateParams.item_id)
              .catch(function () {
                return null;
              });
          },
          tagData: function (item, GroceryFactory) {
            if (!item) {
              return null;
            }
            return GroceryFactory.getTagData(item.tag_id, item.remote_db_id === 3 && item.remote_db_key)
              .catch(function () {
                return null;
              });
          },
          restaurantsCalculatorData: function(BrandsFactory){
            return BrandsFactory.getRestaurantsCalculatorData();
          }
        },
        onEnter: function ($anchorScroll) {
          $anchorScroll();
        },
        data: {
          cssClass: 'page-detail'
        }
      })
      .state('site.go-upc', {
        url:         '/go/upc',
        templateUrl: '/nix_app/items/go-upc.html',
        controller:  'GoUpcCtrl as vm'
      })
      .state('site.go', {
        url:        '/go/:redirectType/:item_id',
        template:   '<div style="padding-top: 200px; text-align: center;"><i class="fa fa-5x fa-spinner fa-spin"></i></div>',
        controller: function (ItemFactory, $state, $filter) {
          var info;
          switch ($state.params.redirectType) {
          case 'i':
            info = ItemFactory.searchItemById($state.params.item_id);
            break;
          case 'usda':
            info = ItemFactory.getNdbNoInfo($state.params.item_id);
            break;
          default:
            return $state.go('site.landing');
            break;
          }

          info
            .then(function (urlParams) {
              var params = {
                brand:     $filter('cleanurl')(urlParams.brand_name),
                item_name: $filter('cleanurl')(urlParams.item_name),
                item_id:   urlParams.item_id
              };
              $state.go('site.itemsDetail', params);
            })
            .catch(function (response) {
              if (response.status === 404) {
                $state.go('site.404');
              } else {
                $state.go('site.50x');
              }
            });
        }
      })
      .state('site.q1', {
        url:         '/q1',
        metaTags:    {
          title:       'Nutritionix',
          description: ''
        },
        templateUrl: baseUrl + '/nix_app/items/q1.html',
        controller:  'Q1Ctrl'
      })
      .state('site.q2', {
        url:         '/q2',
        metaTags:    {
          title:       'Nutritionix',
          description: ''
        },
        templateUrl: baseUrl + '/nix_app/items/q2.html',
        controller:  'Q2Ctrl'
      });
  }
})();
