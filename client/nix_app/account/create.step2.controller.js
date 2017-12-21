(function () {
  'use strict';

  angular
    .module('account')
    .controller('AccountCreateStep2Ctrl', AccountCreateStep2Ctrl);


  function AccountCreateStep2Ctrl($scope, $state, nixTrackApiClient, user, moment,
                                  $q, $modal, baseUrl, $sessionStorage, $filter, $location, countryData) {
    var vm = $scope.vm = this;

    vm.countryData = countryData;

    vm.me = user.getUserProfile(true);
    if (!vm.me.country_code) {
      vm.me.country_code = '840';
    }

    vm.originalMe = angular.copy(vm.me);

    vm.setupAccount = function () {
      vm.setupAccount.$error = null;

      vm.me.account_setup = moment.utc().format();

      return $q.when(vm.originalMe.email ? true : vm.validateEmail())
        .then(() => {
          let update = _.pick(vm.me, ['first_name', 'username', 'account_setup', 'country_code']);
          if(!update.username){
            delete update.username;
          }
          return nixTrackApiClient.me.preferences(update);
        })
        .then(function () {
          if (user.returnUrl) {
            $location.url(user.returnUrl);
            user.returnUrl = null;
          } else {
            if (!$filter('isEmptyObject')($sessionStorage.oauth)) {
              $state.go('oauth.authorize');
            } else if ($sessionStorage.messengerBot) {
              $state.go('messenger-bot.authorize');
            } else if ($sessionStorage.calorieCount) {
              $sessionStorage.calorieCount = null;
              $state.go('account.cabinet.calorieCountImport');
            } else {
              $state.go('account.cabinet.dashboard');
            }
          }
        })
        .catch(function (response) {
          vm.setupAccount.$error = response.data;
        })
    };

    vm.validateEmail = () => {
      vm.validateEmail.$requested = true;
      vm.validateEmail.$success = null;
      vm.validateEmail.$error = null;

      return nixTrackApiClient('/auth/email/verify/request', {params: {email: vm.me.email}})
        .success(() => {
          vm.validateEmail.$success = true;
        })
        .error(error => {
          vm.validateEmail.$error = error;
        })
    };

    vm.validateEmail.$hide = user.get('firstLogin');

    vm.calculateCalories = () => {
      $modal.open({
        animation:   true,
        controller:  'dailyCaloriesModalCtrl as vm',
        size:        'lg',
        templateUrl: baseUrl + '/nix_app/account/modals/dailyCaloriesModal.html'
      }).result.then(calories => {vm.me.daily_kcal = calories;});
    };
  }
})();

