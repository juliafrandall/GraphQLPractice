(function () {
  'use strict';

  angular
    .module('database')
    .controller('databaseRecentlyAddedCtrl', databaseRecentlyAddedCtrl);

  function databaseRecentlyAddedCtrl(title, description, items, breadcrumbs) {
    var vm = this;

    vm.title = title;
    vm.breadcrumbs = breadcrumbs;
    vm.items = items;
    vm.description = description;
  }
})();
