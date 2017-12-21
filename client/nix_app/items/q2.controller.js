(function () {
  'use strict';

  angular
    .module('items')
    .controller('Q2Ctrl', Q2Ctrl);

  function Q2Ctrl($scope, $location, $timeout, $filter, $window, nixTrackApiClient, nixTrackUtils) {
    let vm = $scope.vm = this;

    let item = $location.search();
    vm.item  = {
      item_name:  item.n || '',
      brand_name: item.b || '',
    };

    vm.refreshQrCode = (immediately) => {
      let refresh = () => {
        vm.qrCodeData = $location.absUrl();
      };

      immediately ? refresh() : $timeout(refresh);

      if(!immediately){
        vm.$updated = false;
        $timeout(() => vm.$updated = true);
      }
    };

    vm.refreshQrCode(true);

    vm.servingsQty = +(item.s || 1);

    vm.quantityChanged = function () {
      var servingsQty = parseInt(vm.servingsQty, 10);
      if (servingsQty > 0) {
        vm.calculateTotal();

        $location.search('s', servingsQty);

        vm.refreshQrCode();
      }
    };
    $scope.$watchGroup(['vm.item.item_name', 'vm.item.brand_name'], function () {
      if (vm.item) {
        $location.search('n', vm.item.item_name || null);
        $location.search('b', vm.item.brand_name || null);

        vm.refreshQrCode();
        vm.calculateTotal();
      }
    });

    vm.calculateTotal = function () {
      vm.labelData = $filter('trackFoodToLabelData')(
        nixTrackUtils.sumFoods(vm.foods),
        {
          itemName:                       vm.item.item_name || $location.search().n || 'Item',
          brandName:                      vm.item.brand_name || $location.search().b || 'Nutritionix',
          valueServingUnitQuantity:       1,
          valueServingSizeUnit:           'Serving',
          showItemName:                   true,
          showBrandName:                  true,
          showServingUnitQuantity:        false,
          showServingUnitQuantityTextbox: false
        },
        vm.servingsQty
      );
    };

    vm.process = function () {
      let ingredients = vm.input = $window.decodeURIComponent(item.i || '') || '';

      if (ingredients) {
        nixTrackApiClient.natural.nutrients({
          query:    ingredients,
          timezone: moment.tz.guess() || "US/Eastern"
        }, true)
          .success(function (data) {
            if (!data.foods.length) {
              vm.notFound = {
                message: "We couldn't match any of your foods"
              };
              return;
            }

            vm.foods = data.foods;

            vm.calculateTotal();

          })
          .error(function (error) {
            if (error.message === "We couldn't match any of your foods") {
              vm.notFound = error;
            } else {
              vm.error = error;
            }
          })
      }

      vm.refreshQrCode();
    };

    vm.inputChanged = () => {
      $location.search('i', vm.input);
    };

    vm.process();

  }
})();
