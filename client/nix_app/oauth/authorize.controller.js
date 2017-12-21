(function () {
  'use strict';

  angular
    .module('oauth')
    .controller('AuthorizeCtrl', AuthorizeCtrl);

  function AuthorizeCtrl($scope, $sessionStorage, $location, $state, user, nixTrackApiClient, $timeout) {
    let vm = $scope.vm = this;

    vm.user = user;

    if (!$sessionStorage.oauth) {
      $sessionStorage.oauth = {};
    }

    let oauth = _.extend($sessionStorage.oauth, $location.search());

    if (!user.getIsAuthenticated()) {
      $state.go('account.login.login');
      return;
    }

    nixTrackApiClient(`/oauth/server/client/${oauth.client_id}`)
    .then(response => {
      vm.providerInfo = response.data;
    });

    vm.isAuthenticated = true;

    vm.accept = () => {
      vm.form.data.allowed = true;
      vm.submit();
    };
    vm.cancel = () => {
      vm.form.data.allowed = false;
      vm.submit();
    };

    vm.form = {
      action: nixTrackApiClient.getApiEndpoint(true) + '/oauth/server/authorize',
      data:   _.assign(
        _.omit(oauth, 'state'),
        {'x-user-jwt': user.get('jwt')}
      )
    };

    if (oauth.state) {
      vm.form.action += '?state=' + oauth.state;
    }

    vm.submit = () => {
      $timeout(() => {
        angular.element('form[name=authForm]').submit();
        $sessionStorage.oauth = null;
      });
    };

    vm.userName = user.get('first_name');

    vm.logout = () => {
      user.logout();
      $state.go('account.login.login');
    };
  }
})();
