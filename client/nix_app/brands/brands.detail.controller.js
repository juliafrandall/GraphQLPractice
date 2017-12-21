(function () {
  'use strict';

  angular
    .module('brands')
    .controller('brandsDetailCtrl', brandsDetailCtrl);

  function brandsDetailCtrl(brand, $state, BrandsFactory, debounce, restaurantsCalculatorData) {
    //
    // VARIABLES
    //
    var vm = this;
    vm.brand = brand;
    vm.itemsPerPage = 15;
    vm.currentPage = $state.params.page > 0 ? +$state.params.page : 1;

    vm.navigationState = {
      name:   'site.brandsDetail.navigate',
      params: {
        search: $state.params.search || ''
      }
    };

    vm.calculatorBrand = _.find(restaurantsCalculatorData, {brand_id: brand._id});

    vm.navigate = function () {
      $state.go(vm.navigationState.name, {
        page:   vm.currentPage > 1 ? vm.currentPage : null,
        search: vm.navigationState.params.search && vm.navigationState.params.search.length > 3 ?
                  vm.navigationState.params.search : null
      });
    };

    vm.pageChanged = function () {
      vm.loadItems();
      vm.navigate();
    };

    vm.search = {
      perform: function () {
        vm.currentPage = 1;
        vm.pageChanged();
        vm.search.perform.delayed.cancel();
      }
    };

    vm.search.perform.delayed = debounce(() => {
      if (!vm.navigationState.params.search || vm.navigationState.params.search.length > 3) {
        vm.search.perform();
      }
    }, 1500);


    vm.loadItems = function () {
      BrandsFactory.getBrandProducts($state.params.id, vm.currentPage, vm.navigationState.params.search, vm.itemsPerPage)
        .then(function (results) {
          vm.items = results.total_hits > 0 ? results.items : [];
          vm.total_hits = results.total_hits;
        });
    };

    vm.loadItems();
  }
})();
