(function () {
  'use strict';

  angular
    .module('brands', [])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider
      .state('site.brandsList', {
        abstract:    true,
        url:         '/brands/:type',
        templateUrl: baseUrl + '/nix_app/brands/brands.html',
        controller:  'brandsCtrl as vm',
        resolve:     {
          brands: function ($state, BrandsFactory, $stateParams) {
            return BrandsFactory.searchBrands($stateParams.type)
              .catch(function () {
                $state.go('site.50x');
              });
          }
        },
        onEnter:     function ($anchorScroll) {
          $anchorScroll();
        }
      })
      .state('site.brandsList.navigate', {
        metaTags: {
          title:       'Nutritionix - {{type}} Brand Database',
          description: '{{type.toLowerCase() === "grocery" && "Browse grocery products by brand name.  Currently we have over 15,000 grocery brands." || ' +
                       'type.toLowerCase() === "restaurant" && "Browse restaurant menu items by restaurant name.  Currently we have over 600 restaurant brands."}}'
        },
        resolve:  {
          type: function ($stateParams, $filter) {
            return $filter('ucfirst')($stateParams.type);
          }
        },
        url:      '?page&search'
      })
      .state('site.brandsDetail', {
        abstract:    true,
        url:         '/brand/:brand_name/products/:id',
        templateUrl: baseUrl + '/nix_app/brands/brands.detail.html',
        resolve:     {
          brand: function ($state, $stateParams, BrandsFactory) {
            return BrandsFactory.getBrand($stateParams.id)
              .catch((response) => $state.go('site.' + (response.status === 404 ? '404' : '50x')));
          },
          restaurantsCalculatorData: function (BrandsFactory) {
            return BrandsFactory.getRestaurantsCalculatorData();
          }
        },
        controller:  'brandsDetailCtrl as vm',
        onEnter:     function ($anchorScroll /*, $stateParams */) {
          $anchorScroll();
        },
        data: {
          cssClass: 'page-detail'
        }
      })
      .state('site.brandsDetail.navigate', {
        metaTags: {
          title:       '{{brand.name}} Calories and Nutrition Information. Page {{page}}{{search && ", Search: " + search}}',
          description: 'Calories and nutrition information for {{brand.name}} products. Page {{page}}{{search && ", Search: " + search}}',
          properties:  {
            'og:image':      '{{brand.logo}}',
            'twitter:image': '{{brand.logo}}'
          }
        },
        url:      '?page&search',
        resolve:  {
          page:   $stateParams => $stateParams.page || 1,
          search: $stateParams => $stateParams.search || '',
        }
      });
  }
})();
