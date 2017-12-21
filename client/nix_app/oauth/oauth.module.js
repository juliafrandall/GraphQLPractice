(function () {
  'use strict';

  angular
    .module('oauth', [])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('oauth', {
      abstract: true,
      templateUrl: baseUrl + '/nix_app/layouts/account.html',
      data:        {
        cssClass: 'account'
      }
    });

    $stateProvider.state('oauth.authorize', {
      url:        '/authorize',
      metaTags:   {
        title: 'oAuth Authorize'
      },
      controller: 'AuthorizeCtrl',
      templateUrl:   baseUrl + '/nix_app/oauth/authorize.html'
    });
  }
})();
