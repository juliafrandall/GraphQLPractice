'use strict';

angular.module('items')
  .controller('GoUpcCtrl', function GoUpcCtrl(nixTrackApiClient, vcRecaptchaService, $state) {
    const vm = this;

    vm.upc = '';

    vm.recaptcha = {
      response: null,
      widgetId: null,
      expired:  function () {
        vcRecaptchaService.reload(vm.recaptcha.widgetId);
      }
    };

    vm.submit = () => {
      if (vm.recaptcha.response) {
        vm.submit.$busy  = true;
        vm.submit.$error = null;

        nixTrackApiClient('/search/item', {params: {upc: vm.upc}})
          .then(response => {
            $state.go('site.go', {redirectType: 'i', item_id: response.data.foods[0].nix_item_id})
          })
          .catch(response => {
            vm.submit.$error = response.data;
          })
          .finally(() => {
            vm.submit.$busy = false;
            vcRecaptchaService.reload(vm.recaptcha.widgetId);
          })
      }
    };
  });
