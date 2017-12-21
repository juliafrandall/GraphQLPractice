(function () {
  'use strict';

  angular
    .module('carouselSlide')
    .controller('carouselSlideController', carouselSlideController);

  function carouselSlideController($scope, baseUrl, $state) {
    var vm = this;

    vm.interval = 8000;

    $scope.slides = [
      {
        icon:            '<i class="fa fa-mobile"></i>',
        backgroundImage: baseUrl + '/nix_assets/images/spinach_scaled.jpg',
        slideTitle:      "NEW! Nutritionix Track App",
        text:            'Track what you eat in 60 seconds per day.',
        link:            $state.href('site.trackApp')
      },
      {
        icon:            '<i class="fa fa-globe"></i>',
        backgroundImage: baseUrl + '/nix_assets/images/spinach_scaled.jpg',
        slideTitle:      "The world's largest verified nutrition database.",
        text:            'Over 5M consumers use our nutrition data every month.',
        link:            $state.href('site.database')
      },
      {
        icon:            '<i class="fa fa-cloud"></i>',
        backgroundImage: baseUrl + '/nix_assets/images/spinach_scaled.jpg',
        slideTitle:      'Nutrition API',
        text:            '100+ health apps make 5M+ queries to the Nutritionix API every month.',
        link:            $state.href('site.businessApi')
      }
    ];
  }
})();
