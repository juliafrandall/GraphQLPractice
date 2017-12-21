(function () {
  'use strict';

  angular
    .module('carouselSlide')
    .directive('carouselSlide', carouselSlide);

  function carouselSlide(ServicesFactory) {
    return {
      templateUrl: ServicesFactory.formatTemplateUrl('/nix_app/landing/carousel/carousel.html'),
      scope: true,
      controller: 'carouselSlideController as vm'
    };
  }
})();
