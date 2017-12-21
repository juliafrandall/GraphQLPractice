(function () {
  'use strict';

  angular
    .module('interactiveNutritionTools')
    .controller('interactiveNutritionToolsCtrl', interactiveNutritionToolsCtrl);

  function interactiveNutritionToolsCtrl($scope, $anchorScroll) {

    //
    // VARIABLES
    //

    var vm = this;

    vm.slideCount = [
      {
        breakpoint: 450,
        settings: {
          slidesToShow: 3,
          rtl: true
        }
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 6,
          rtl: true
        }
      }
    ]



  }
})();
