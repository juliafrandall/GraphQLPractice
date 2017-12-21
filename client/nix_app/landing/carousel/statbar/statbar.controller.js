(function () {
  'use strict';

  angular
    .module('statbar')
    .controller('StatbarCtrl', StatbarCtrl);

  function StatbarCtrl(StatbarFactory, $timeout) {

    //
    // VARIABLES
    //
    var vm = this;
    vm.showAnimation = true;
    vm.screenReader = true;

    StatbarFactory.getStats().then(function (stats) {
      vm.cpgCount = stats.cpg_count;
      vm.restaurantCount = stats.restaurant_count;
      vm.cpgImagesCount = stats.cpg_images_count;
      vm.usdaCount = stats.usda_count;
      vm.updatedAt = stats.updated_at;
      vm.lastItemAddedAt = stats.last_item_added;
    });

    $timeout(function () {
      vm.showAnimation = false;
    }, 1000);



  }
})();
