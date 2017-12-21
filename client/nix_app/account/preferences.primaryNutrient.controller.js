(function () {
  'use strict';

  angular
    .module('account')
    .controller('AccountPreferencesPrimaryNutrientCtrl', AccountPreferencesPrimaryNutrientCtrl);

  function AccountPreferencesPrimaryNutrientCtrl($scope, nixTrackApiClient, user) {
    var vm = $scope.vm = this;

    let me = user.getIdentity().user;

    vm.primaryNutrients = [
      {id: 208, name: 'Calories', unit: 'kcal'},
      {id: 205, name: 'Carb', unit: 'g'},
      {id: 307, name: 'Sodium', unit: 'mg'},
      {id: 203, name: 'Protein', unit: 'g'}
    ];

    vm.primaryNutrients[0].value = me.daily_kcal;

    me.nutrPrefs.forEach(pref => {
      let nutrient = _.find(vm.primaryNutrients, {id: pref.nutr_id});
      if (nutrient) {
        nutrient.value = pref.goal;
      }
    });

    vm.primaryNutrient = _.find(vm.primaryNutrients, {id: me.default_nutrient});
    vm.primaryNutrient.value = me.default_nutrient_value;

    vm.submit = () => {
      if (!vm.primaryNutrient.value) {return;}

      vm.submit.$busy = true;
      nixTrackApiClient.me.preferences({
          default_nutrient:       vm.primaryNutrient.id,
          default_nutrient_value: vm.primaryNutrient.value,
          daily_kcal:             vm.primaryNutrient.id === 208 ? vm.primaryNutrient.value : undefined
        })
        .success(profile => {user.setUserProfile(profile);})
        .finally(() => {vm.submit.$busy = false;});
    };
  }
})();
