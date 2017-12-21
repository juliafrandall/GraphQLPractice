(function () {
  'use strict';

  angular
    .module('diets', ['nutritionix'])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('site.diets', {
        url:         '/diets',
        metaTags:    {
          title:       'Popular Diets',
          description: 'Popular Diets'
        },
        controller:  'DietsCtrl',
        templateUrl: baseUrl + '/nix_app/diets/diets.html',
        onEnter:     function ($anchorScroll) {
          $anchorScroll();
        },
        resolve:     {
          diets: (listLabelsService, $filter) => listLabelsService.get()
            .then(diets => $filter('filter')(diets, {category_id: "1"}))
        }
      })
      .state('site.dietDetail', {
        url:         '/diet/view/:id',
        metaTags:    {
          title:       '{{diet.name}} Diet - Resources and Recipes',
          description: '{{diet.name}} Diet - Resources and Recipes'
        },
        controller:  'DietDetailCtrl',
        templateUrl: baseUrl + '/nix_app/diets/diet.html',
        onEnter:     function ($anchorScroll) {
          $anchorScroll();
        },
        data:        {
          cssClass: 'page-detail'
        },
        resolve:     {
          diet: (listLabelsService, $stateParams) => listLabelsService.get()
            .then(diets => _.find(diets, {id: $stateParams.id}))
        }
      });
  }
})();
