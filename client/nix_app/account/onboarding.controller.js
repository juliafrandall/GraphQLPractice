(function () {
  'use strict';

  angular
    .module('account')
    .controller('AccountOnBoardingCtrl', AccountOnBoardingCtrl);

  function AccountOnBoardingCtrl($scope, user, nixTrackApiClient) {
    var vm = $scope.vm = this;

    vm.name = user.get('first_name');

    nixTrackApiClient.me().success(me => {
      vm.dailyKcal = !!me.daily_kcal;
      vm.sms = !!me.enable_weekday_sms;
      vm.fitbit = !!_.find(me.oauths, {provider: "fitbit"});

    });

    nixTrackApiClient
      .log.get({limit: 1})
      .success(log => {
        vm.log = log.foods.length > 0;
      });

    vm.addFoodModal = () => {
      if ($scope.$parent && $scope.$parent.vm && $scope.$parent.vm.addFoodModal) {
        $scope.$parent.vm.addFoodModal();
      }
    };
  }
})();
