(function () {
  'use strict';

  angular
    .module('list')
    .controller('ListIndexCtrl', ListIndexCtrl);

  function ListIndexCtrl($scope, lists, $filter, $location, $anchorScroll) {
    const vm = $scope.vm = this;
    vm.lists = [];

    vm.currentPage  = $location.search().page || 1;
    vm.itemsPerPage = 10;
    vm.total        = 0;

    vm.search = $location.search().q || '';

    vm.setPage = page => {
      let maxPage;
      vm.lists = lists;

      if (vm.search) {
        vm.lists = $filter('filter')(vm.lists, {name: vm.search});
      }

      vm.total = vm.lists.length;

      if (!page || page <= 0) {
        page = 1;
      }

      maxPage = Math.ceil(vm.total / vm.itemsPerPage);

      if (page > maxPage) {
        page = maxPage;
      }

      vm.currentPage = page;

      vm.lists = $filter('limitTo')(vm.lists, vm.itemsPerPage, (page - 1) * vm.itemsPerPage);

      $location.search('page', page === 1 ? null : page);
      $location.search('q', vm.search || null);

      $anchorScroll();
    };

    vm.setPage(vm.currentPage);
  }
})();
