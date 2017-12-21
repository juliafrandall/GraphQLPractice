(function () {
  'use strict';

  angular
    .module('account')
    .controller('editFoodModalCtrl', editFoodModalCtrl);

  function editFoodModalCtrl($rootScope, $scope, $modalInstance, $modal, $filter, ServicesFactory,
                             confirm, nixTrackApiClient, nixTrackUtils, parentVm, food,
                             reviewFoodsBasket, user, consumedAt, ImageUpload, $timeout) {
    const vm = $scope.vm = this;

    vm.primaryNutrients = parentVm.dailyIntake.primaryNutrients;

    vm.food = food;
    vm.servingQty = food.serving_qty;

    vm.user = user.getUserProfile();

    vm.showNotes = vm.food.note;

    vm.updateFood = () => {
      if (vm.servingQty) {
        let foodBackup = vm.food;
        vm.food = nixTrackUtils.multiplyFoodNutrients(
          angular.copy(food),
          nixTrackUtils.calculateFoodMultiplier(food, vm.servingQty),
          true
        );

        vm.food.consumed_at = foodBackup.consumed_at;
      }
    };

    vm.copyFoodModal = function () {
      $modal.open({
        animation:   true,
        controller:  'copyFoodModalCtrl',
        size: 'copy-food',
        templateUrl: ServicesFactory.formatTemplateUrl('/nix_app/account/modals/copyFoodModal.html'),
        resolve:     {
          food: () => vm.food
        }
      }).result.then(() => {parentVm.refresh();});

      $modalInstance.dismiss();
    };

    vm.copy = () => {
      reviewFoodsBasket.push(nixTrackUtils.copyFood(vm.food));
      vm.close();
      reviewFoodsBasket.openModal();
    };

    vm.update = () => {
      vm.food.consumed_at = vm.consumedAt.getValue().utc().format();
      vm.food.meal_type   = vm.consumedAt.getMealType();

      vm.imageUpload.submit()
        .then(() => nixTrackApiClient.log.update(vm.food))
        .then(response => {
          $rootScope.$broadcast('track:foods-updated');
          $modalInstance.close(response.data);
        });
    };

    vm.delete = () => {
      confirm('Are you sure you want to delete this item')
        .then(() => nixTrackApiClient.log.delete([{id: food.id}]))
        .then(response => {
          $rootScope.$broadcast('track:foods-deleted');
          $modalInstance.close(response.data)
        })
    };



    vm.updateLabel = function(){
      vm.labelData = $filter('trackFoodToLabelData')(vm.food, {
        showAmountPerServing:           false,
        showItemName:                   false,
        showServingUnitQuantity:        false,
        showServingUnitQuantityTextbox: false,
        showTransFat:                   false,
        valuePhosphorus:                $filter('nutrient')(vm.food.full_nutrients, 305, 'value'),
        vitamin_d:                      $filter('nutrient')(vm.food.full_nutrients, 324, 'value')
      });
    };

    vm.updateLabel();

    vm.close = function () {
      $modalInstance.dismiss();
    };

    vm.imageUpload        = new ImageUpload('foods');
    // vm.imageUpload.submitOnChange = true;
    vm.imageUpload.submit = function () {
      this.$busy = true;

      return this._submit((vm.consumedAt.getValue() || moment()).format('YYYY-MM-DD'))
        .then(urls => {
          if (urls) {
            vm.food.photo = {
              thumb:            urls.cdn.thumb,
              highres:          urls.cdn.full,
              is_user_uploaded: true
            };
          }
        })
        .finally(() => {
          this.clearUpload();
          $timeout(() => this.$busy = false, 1000)
        });
    };

    vm.consumedAt = angular.copy(consumedAt);
    vm.consumedAt.refresh();
    vm.consumedAt.setValue(vm.food.consumed_at, vm.food.meal_type);

    vm.showDatePicker = false;

    $scope.$watch(() => vm.consumedAt.day, day => {
      vm.consumedAt.showDatePicker = !day;

      if (day) {
        vm.showDatePicker = false;
      }
    });
  }
})();
