(function () {
  'use strict';

  angular
    .module('naturalLanguage', ['labs.twitter'])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('site.naturalLanguage', {
      url:         '/business/natural-language',
      metaTags: {
        title: 'Nutritionix - Natural Language Initiatives'
      },
      templateUrl: baseUrl + '/nix_app/business/natural-language/naturalLanguage.html',
      controller:  'naturalLanguageCtrl as vm',
      onEnter:     function ($anchorScroll) {
        $anchorScroll();
      },
      data : {
        cssClass: 'page-natural-language'
      }
    });
  }
})();
