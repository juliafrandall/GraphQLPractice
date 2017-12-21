(function () {
  'use strict';

  angular
    .module('category', ['nutritionix'])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('site.category', {
      url: '/grocery/category',
      metaTags: {
        title:       'Nutritionix - Grocery Categories',
        description: 'Browse a list of the top scanned grocery products by category.'
      },
      templateUrl: baseUrl + '/nix_app/grocery/categories/category.html',
      controller: 'categoryCtrl as vm',
      resolve: {
        results: function (GroceryFactory) {
          return GroceryFactory.getCategories()
        }
      },
      onEnter: function ($anchorScroll) {
        $anchorScroll();
      }
    });
  }
})();
