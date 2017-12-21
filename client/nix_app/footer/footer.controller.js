(function(){
  'use strict';

  angular
    .module('footer')
    .controller('FooterCtrl', FooterCtrl);

  function FooterCtrl(moment) {

      var vm = this;

      vm.copyrightYear = moment().format('YYYY');

  }

})();
