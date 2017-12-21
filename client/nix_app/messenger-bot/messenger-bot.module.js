(function () {
  'use strict';

  angular
    .module('messenger-bot', [])
    .config(config);

  function config($stateProvider, baseUrl) {
    $stateProvider.state('messenger-bot', {
      abstract: true,
      templateUrl: baseUrl + '/nix_app/layouts/account.html',
      data:        {
        cssClass: 'account'
      }
    });

    $stateProvider.state('messenger-bot.authorize', {
      url:        '/messenger-bot/authorize',
      metaTags:   {
        title: 'Authorize Messenger Bot'
      },
      controller: 'MessengerBotAuthorizeCtrl',
      templateUrl:   baseUrl + '/nix_app/messenger-bot/authorize.html'
    });
  }
})();
