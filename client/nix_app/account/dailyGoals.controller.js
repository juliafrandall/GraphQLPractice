(function () {
  'use strict';

  angular
    .module('account')
    .controller('AccountDailyGoalsCtrl', AccountDailyGoalsCtrl);

  function AccountDailyGoalsCtrl($scope, user, nixTrackApiClient, $timeout) {
    const vm = $scope.vm = this;

    let userProfile = user.getUserProfile();

    vm.goals = {
      'daily_kcal':        null,
      'daily_carbs_pct':   null,
      'daily_protein_pct': null,
      'daily_fat_pct':     null
    };

    _.forEach(vm.goals, (value, key) => {
      if (userProfile[key]) {
        vm.goals[key] = userProfile[key];
      }
    });

    vm.validateGoalsSum = () => {
      let setGoals = _(vm.goals)
        .pick(['daily_carbs_pct', 'daily_protein_pct', 'daily_fat_pct'])
        .values()
        .filter(g => !!g || g === 0);

      vm.showGoalsTotal = setGoals.value().length > 1;
      vm.goalsSum = setGoals.sum();
      vm.validGoalsSum = vm.goalsSum <= 100;
    };

    vm.validateGoalsSum();


    vm.submit = () => {
      vm.submit.$error   = null;
      vm.submit.$success = null;
      vm.submit.$busy    = true;

      let goals = _.clone(vm.goals);
      _.forEach(goals, (value, key) => {
        if (!value && !(+value === 0)) {
          goals[key] = null;
        }
      });

      nixTrackApiClient.me.preferences(goals)
        .then(response => {
          vm.submit.$success = true;
          $timeout(() => vm.submit.$success = null, 2000);

          user.setUserProfile(response.data)
        })
        .catch(response => {
          vm.submit.$error = response.data;
        })
        .finally(() => {
          vm.submit.$busy = null;
        })
    };

  }
})();
