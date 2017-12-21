(function () {
  'use strict';


  angular
    .module('grocery', ['chart.js', 'ui-rangeSlider'])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('site.grocery', {
      url:         '/grocery/category/:parent_tag/:child_tag/:id',
      metaTags:    {
        title: 'Top 50 most popular: {{results.tag_name}}',
        description: 'Grocery products in the {{results.parent_tag_name}} > {{results.tag_name}} category.'
      },
      templateUrl: baseUrl + '/nix_app/grocery/grocery.html',
      controller:  'groceryCtrl as vm',
      resolve:     {
        results: function (GroceryFactory, $stateParams) {
          return GroceryFactory.getTagData($stateParams.id)
            .then(function (response) {
              return response.data;
            })
        }
      },
      onEnter:     function ($anchorScroll) {
        $anchorScroll();
      }
    });
  }
})();
