(function () {
  'use strict';

  angular.module('account.recipes')
    .controller('AccountNewRecipeCtrl', AccountNewRecipeCtrl);

  function AccountNewRecipeCtrl($scope, ServicesFactory, $modal) {
    let vm = $scope.vm = this;

    vm.addIngredientsModal = function () {
      $modal.open({
        animation:   true,
        controller:  'addIngredientsModalCtrl',
        templateUrl: ServicesFactory.formatTemplateUrl('/nix_app/account/modals/addIngredientsModal.html')
      });
    };

  }
}());
