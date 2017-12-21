(function () {
  'use strict';

  angular.module('track-widget')
    .directive('trackWidget', function ($modal, user, $rootScope, $location, $state, forceHttps) {
      return {
        restrict: 'AE',
        scope:    {
          food:        '=',
          buttonClass: '=',
          buttonLabel: '='
        },
        template: `<button class="btn" ng-click="vm.openModal()" ng-class="vm.button.class">
                    <i class="fa fa-plus-circle"></i>
                    {{vm.button.label}}
                   </button>`,
        link:     function (scope, element, attributes) {
          let vm = scope.vm = {};

          vm.button = {
            'class': scope.buttonClass || 'btn-success',
            label:   scope.buttonLabel || 'Add to food log'
          };

          vm.openModal = function () {
            if (user.getIsAuthenticated()) {
              vm.openModal.modal();
            } else {
              forceHttps.disable();
              let url = $location.url();
              let unwatch = $rootScope.$watch(
                () => 'a:' + user.getIsAuthenticated() + 'u:' + $location.url(),
                () => {
                  if (user.getIsAuthenticated() && $location.url() === url) {
                    vm.openModal.modal();
                    unwatch();
                    forceHttps.enable();
                  }
                }
              );

              user.returnUrl = url;

              $state.go('account.login.login');
            }
          };

          vm.openModal.modal = () => {
            return $modal.open({
              animation:   true,
              controller:  'TrackWidgetCtrl as vm',
              size:        'md',
              templateUrl: '/nix_app/track-widget/track-widget.html',
              resolve:     {
                food: () => angular.copy(scope.food)
              }
            });
          }
        }

      }
    })
}());
