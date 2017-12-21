(function () {
  'use strict';

  angular
    .module('database', [])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('site.database', {
      url: '/database',
      metaTags: {
        title:       'Nutritionix - Database Licensing',
        description: 'The Nutritionix database is the largest verified nutrition database in the world.  It currently includes over 500K food products from the US and Canada.'
      },
      resolve:     {
        stats: function (StatbarFactory) {
          return StatbarFactory.getStats();
        }
      },
      templateUrl: baseUrl + '/nix_app/database/database.html',
      controller: 'databaseCtrl as vm',
      onEnter: function ($anchorScroll) {
        $anchorScroll();
      }
    });

    $stateProvider.state('site.database-recently-added', {
      url:         '/database/recently-added',
      metaTags:    {
        title:       '{{title}}',
        description: 'A list of the most recently added products in the Nutritionix Database.'
      },
      templateUrl: baseUrl + '/nix_app/database/database-recently-added.html',
      controller:  'databaseRecentlyAddedCtrl as vm',
      resolve:     {
        title:       function () {
          return 'Recently Added Products';
        },
        description: function(){
          return 'Below is a list of products that were recently added to the Nutritionix database';
        },
        breadcrumbs: function ($state) {
          return [
            {
              text: 'Our Database',
              link: $state.href('site.database')
            },
            {
              text: 'Recently Added'
            }
          ]
        },
        items:       function ($http) {
          return $http.get('/nixapi/database/recently-added-products')
            .then(function (response) {
              return response.data;
            });
        }
      },
      onEnter:     function ($anchorScroll) {
        $anchorScroll();
      }
    });

    $stateProvider.state('site.database-recently-added-common-foods', {
      url:         '/database/recently-added/common-foods',
      metaTags:    {
        title:       '{{title}}',
        description: 'A list of the most recently added common foods in the Nutritionix Database.'
      },
      templateUrl: baseUrl + '/nix_app/database/database-recently-added.html',
      controller:  'databaseRecentlyAddedCtrl as vm',
      resolve:     {
        title:       function () {
          return 'Recently Added Common Foods';
        },
        description: function(){
          return 'Below is a list of common foods that were recently added to the Nutritionix database';
        },
        breadcrumbs: function ($state) {
          return [
            {
              text: 'Our Database',
              link: $state.href('site.database')
            },
            {
              text: 'Recently Added',
              link: $state.href('site.database-recently-added')
            },
            {
              text: 'Common Foods'
            }
          ]
        },
        items:       function ($http) {
          return $http.get('/nixapi/database/recently-added-products', {params: {common: true}})
            .then(function (response) {
              return response.data;
            });
        }
      },
      onEnter:     function ($anchorScroll) {
        $anchorScroll();
      }
    });
  }
})();
