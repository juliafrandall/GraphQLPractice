(function () {
  'use strict';

  angular
    .module('messenger-bot')
    .controller('MessengerBotAuthorizeCtrl', MessengerBotAuthorizeCtrl);

  function MessengerBotAuthorizeCtrl($scope, $sessionStorage, $location, $state, user, nixTrackApiClient, $window) {
    let vm = $scope.vm = this;

    vm.user = user;

    if (!$sessionStorage.messengerBot) {
      $sessionStorage.messengerBot = {};
    }

    let messengerBot = _.extend($sessionStorage.messengerBot, $location.search());

    if (!user.getIsAuthenticated()) {
      $state.go('account.login.login');
      return;
    }

    nixTrackApiClient('/messenger_bot/link', {
      method: 'POST',
      data:   messengerBot
    })
      .success(response => {
        $sessionStorage.messengerBot = null;
        $window.location             = response.redirect_uri;
      })
      .error(error => {
        vm.error = error;
      });
  }
})();
