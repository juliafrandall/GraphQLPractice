(function () {
  'use strict';

  angular
    .module('calculators', [])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('site.calculators', {
      url:         '/consumer/nutrition-calculator',
      metaTags:    {
        title:       'Nutritionix - Restaurant Nutrition Calculators',
        description: 'Nutritionix provides nutrition calculators to over 50 different restaurant chains in the US and Canada.'
      },
      templateUrl: baseUrl + '/nix_app/consumerTools/calculators/calculators.html',
      controller:  'calculatorsCtrl as vm',
      resolve:     {
        calculators: function (CalculatorsFactory) {
          return CalculatorsFactory.getCalculators()
        }
      },
      onEnter:     function ($anchorScroll) {
        $anchorScroll();
      }
    });
  }
})();
