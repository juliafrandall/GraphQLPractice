(function () {
  'use strict';

  angular
    .module('database')
    .controller('databaseCtrl', databaseCtrl);

  function databaseCtrl(stats) {
    this.stats = stats;
  }
})();
