(function (window, document, angular, undefined) {
  'use strict';
  angular.module('angular-stripe', [])
    .provider('stripe', function () {
      let created, publishableKey;

      this.setPublishableKey = function (pk) {
        publishableKey = pk;
      };

      /**
       * Public Service
       */
      this.$get = ['$q', '$log', function ($q, $log) {
        var ready   = $q.defer(),
            service = {};

        this._createScriptTag = function () {
          if (created === true) {
            $log.warn('Stripe script tag already created');
            return;
          }

          (function () {
            var se    = document.createElement('script');
            se.type   = 'text/javascript';
            se.async  = true;
            se.src    = 'https://js.stripe.com/v3/';
            var done  = false;
            se.onload = se.onreadystatechange = function () {
              if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
                service.api = Stripe(publishableKey);

                done = true;
                ready.resolve(service.api);
              }
            };
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(se, s);
          })();

          created = true;
          return true;
        };


        this._createScriptTag();

        service.ready = ready.promise;

        return service;
      }];
    })

    .directive('stripeCard', function (stripe) {
      let stripeElements;

      stripe.ready.then(stripe => {
        stripeElements = stripe.elements();
      });


      return {
        template: '<div></div>',
        replace:  true,
        scope:    {
          error: '=',
          card:  '=',
          cardStyle: '=?'
        },
        link:     function (scope, element, attributes) {
          stripe.ready.then(stripe => {
            let card = scope.card = stripeElements.create('card', {style: scope.style || {}});
            card.mount(element[0]);

            card.addEventListener('change', event => {
              scope.error = event.error;
              scope.$apply();
            })
          });
        }
      }
    });
})(window, document, window.angular);
