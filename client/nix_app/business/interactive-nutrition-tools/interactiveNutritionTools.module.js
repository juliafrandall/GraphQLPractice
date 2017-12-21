(function () {
  'use strict';

  angular
    .module('interactiveNutritionTools', ['slickCarousel'])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('site.interactiveNutritionTools', {
      url:         '/business/interactive-nutrition-tools',
      metaTags:    {
        title:       'Nutritionix - Interactive Nutrition Tools',
        description: 'Nutritionix provides a suite of tools to help restaurants organize and publish their nutrition information online.'
      },
      templateUrl: baseUrl + '/nix_app/business/interactive-nutrition-tools/interactiveNutritionTools.html',
      controller:  'interactiveNutritionToolsCtrl as vm',
      onEnter:     function ($anchorScroll) {
        $anchorScroll();
      },
      data: {
        cssClass: 'interactiveNutritionTools'
      }
    });
  }
})();
