(function() {
    'use strict';

    angular
        .module('account')
        .directive('slideout', function() {
            return {
                restrict: 'AE',
                scope: {
                    panelSelector: "=",
                    menuSelector: "=",
                    padding: "=?",
                    tolerance: "=?"
                },
                link: function(scope, element) {

                    if (angular.isUndefined(scope.padding)) {
                        scope.padding = 256;
                    }
                    if (angular.isUndefined(scope.tolerance)) {
                        scope.tolerance = 70;
                    }

                    var slideout = new Slideout({
                        'panel': element.find(scope.panelSelector)[0],
                        'menu': element.find(scope.menuSelector)[0],
                        'padding': scope.padding,
                        'tolerance': scope.tolerance
                    });


                    document.querySelector('.slideout-nav-button').addEventListener('click', function() {
                        slideout.toggle();
                    });

                }
            };

        });

})();
