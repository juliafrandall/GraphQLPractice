(function () {
  'use strict';

  angular
    .module('restaurantPlatform', ['vcRecaptcha'])
    .config(config)
    .config(recaptcha)
    .run(vcRecaptchaService => {});

  function config($stateProvider, baseUrl) {
    $stateProvider.state('site.restaurantPlatform', {
      url:         '/business/restaurant',
      metaTags:    {
        title:       'Nutritionix - Restaurant Nutrition Solutions',
        description: 'Nutritionix provides a suite of tools to help restaurants organize and publish their nutrition information online.'
      },
      templateUrl: baseUrl + '/nix_app/business/restaurant-platform/restaurantPlatform.html',
      controller:  'restaurantPlatformCtrl as vm',
      onEnter:     function ($anchorScroll) {
        $anchorScroll();
      }
    });
  }

  function recaptcha(vcRecaptchaServiceProvider) {
    if (location.host.indexOf('localhost') === -1) {
      vcRecaptchaServiceProvider.setSiteKey('6Le85OQSAAAAAN9HqLo1BpXxUu6DWap-caFTZsYj');
    } else {
      vcRecaptchaServiceProvider.setSiteKey('6LexbScTAAAAAIEyWOox1cf6kEB5GziZJ9eL4eWI');
    }

    var se = document.createElement('script');
    se.type = 'text/javascript';
    se.async = true;
    se.src = 'https://www.google.com/recaptcha/api.js?onload=vcRecaptchaApiLoaded&render=explicit';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(se, s);
  }
})();
