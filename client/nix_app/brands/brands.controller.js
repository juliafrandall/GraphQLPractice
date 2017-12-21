(function () {
  'use strict';

  angular
    .module('brands')
    .controller('brandsCtrl', brandsCtrl);

  function brandsCtrl(brands, $state, $filter, $location) {
    //
    // VARIABLES
    //
    var vm = this;
    vm.navigationState = {
      name:   'site.brandsList.navigate',
      params: {
        search: null
      }
    };

    vm.navigationState.params.search = $state.params.search || $location.search().search || '';
    vm.itemsPerPage = 20;
    vm.total = 0;

    vm.type = $state.params.type;

    if ($state.params.type === 'restaurant') {
      vm.typeName = 'Restaurant';
      vm.typeHintName = 'restaurant';
      vm.switchType = 'grocery';
      vm.switchTypeName = 'Grocery';
    } else {
      vm.typeName = 'Grocery';
      vm.typeHintName = 'brand';
      vm.switchType = 'restaurant';
      vm.switchTypeName = 'Restaurant';
    }

    vm.setPage = function (page, nonavigate) {
      var maxPage;
      vm.brands = brands;

      if (!page || page <= 0) {
        page = 1;
      }

      vm.currentPage = page;

      if (vm.navigationState.params.search) {
        vm.brands = $filter('filter')(vm.brands, vm.navigationState.params.search);
      }

      vm.total = vm.brands.length;

      maxPage = Math.ceil(vm.total / vm.itemsPerPage);

      if (page > maxPage) {
        page = maxPage;
        nonavigate = false;
      }

      vm.brands = $filter('limitTo')(vm.brands, vm.itemsPerPage, (page - 1) * vm.itemsPerPage);
      vm.brands = $filter('orderBy')(vm.brands, 'name');

      if (!nonavigate) {
        $state.go('site.brandsList.navigate', {
          page:   page > 1 ? page : null,
          search: vm.navigationState.params.search || null
        });
      }
    };

    vm.setPage($state.params.page || 1, true);
  }
})();
