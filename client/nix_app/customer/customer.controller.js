(function () {
  'use strict';

  angular
    .module('customer')
    .controller('customerCtrl', customerCtrl);

  function customerCtrl($state, $http, stripe, vcRecaptchaService, $q) {
    const vm = this;

    vm.stripeCardStyle = {
      base:    {
        color:           '#32325d',
        lineHeight:      '24px',
        fontFamily:      '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing:   'antialiased',
        fontSize:        '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color:     '#fa755a',
        iconColor: '#fa755a'
      }
    };

    vm.recaptcha = {
      response: null,
      widgetId: null,
      expired:  function () {
        vcRecaptchaService.reload(vm.recaptcha.widgetId);
      }
    };

    vm.loadUserData = response => {
      $http.post(`/nixapi/customer/${$state.params.customerId}`, {
          recaptcha: response,
          key:       $state.params.key
        })
        .then(response => {
          vm.customer = response.data;
        })
        .catch(response => {
          vm.error = response.data;
        })
    };


    stripe.ready.then(stripe => {
      vm.submit = () => {
        vm.submit.$busy = true;
        $q.when(stripe.createToken(vm.card))
          .then(result => {
            if (result.error) {
              return $q.reject(result.error);
            }

            return $http.put(`/nixapi/customer/${$state.params.customerId}/update-card-info`, {
                key:   $state.params.key,
                token: result.token,
              })
              .catch(response => response.data)
          })
          .then(() => {
            vm.success = true;
            vm.card.clear();
          })
          .catch(error => {
            vm.error = error;
          })
          .finally(() => {
            vm.submit.$busy = false;
          })
      }
    });
  }
})();
