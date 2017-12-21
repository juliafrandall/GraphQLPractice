(function () {
  'use strict';

  angular.module('nutritionix.forms', [])
    .config(function config($stateProvider, baseUrl) {
      $stateProvider.state('site.forms', {
        url:         '/forms/{name:any}/:id',
        metaTags:    {
          title: '{{title}}'
        },
        templateUrl: baseUrl + '/nix_app/forms/forms.html',
        controller:  'formsCtrl as vm',
        resolve:     {
          title: () => {
            // if we need more forms, we will want ot load external json file with metadata and read title from there
            // we could also try to fetch it from resulting wufoo html, not sure how hard would iut be
            return 'Nutritionix Natural API Waiting List';
          }
        }
      });
    })
}());
