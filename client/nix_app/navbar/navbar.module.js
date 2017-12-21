(function () {
  'use strict';

  angular
    .module('navbar', ['nix.api'])
    .config(config)
    .factory('search', search);

  function config(nixApiProvider) {
    nixApiProvider.setApiCredentials('732e2c1b', 'ec0253de172a689b75f2266e3386dfa5');
  }

  function search($rootScope, $state, nixApi, debounce, $q, $filter) {
    var cancelRequests = false;
    var debouncedSearch = debounce(function (searchQuery, resolve) {
      if (searchQuery !== '') {
        return nixApi.autocomplete(searchQuery)
          .then(function (suggestions) {
            if (!cancelRequests) {
              resolve($filter('orderBy')(suggestions.data, item => item.text.length));
            }

            resolve([]);
          });
      }
    }, 200);

    var service = {
      query:   '',
      perform: function () {
        if (this.query) {
          $state.go('site.itemsSearch', {
            q:    this.query,
            page: null
          });
        }
      },
      suggest: function (viewValue) {
        cancelRequests = false;
        return $q(function (resolve, reject) {
          debouncedSearch(viewValue, resolve);
        });
      }
    };

    $rootScope.$on('$stateChangeStart', function () {
      cancelRequests = true;
    });

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams) {
      if (toState.name === "site.itemsSearch") {
        if (!service.query && toParams.q) {
          service.query = toParams.q.replace(/\-/g, ' ');
        }
      } else {
        service.query = '';
      }
    });

    return service;
  }

})();
