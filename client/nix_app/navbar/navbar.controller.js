(function () {
  'use strict';

  angular
    .module('navbar')
    .controller('NavbarCtrl', NavbarCtrl)
    .directive('focusMe', focusMe);

  function NavbarCtrl($rootScope, search, $state, user, messages, versionMonitor, InstantSmartSearch, $filter, Analytics) {

    //
    // VARIABLES
    //

    var vm = this;

    vm.user = user;

    vm.messages = messages;

    vm.navBarCollapsed = true;
    vm.searchBarCollapsed = $state.current.name !== "site.itemsSearch" || !$state.params.q;

    vm.showSiteMenu =
      $state.current.name.substr(0, 4) === 'site' ||
      $state.current.name.substr(0, 3) === 'dev';

    vm.showAccountMenu =
      $state.current.name === 'account.auth.create.step2' ||
      $state.current.name.substr(0, 7) === 'account' &&
      $state.current.name.substr(0, 12) !== 'account.auth' &&
      $state.current.name.substr(0, 13) !== 'account.login';

    vm.search                                  = search;
    vm.instantSmartSearch                      = new InstantSmartSearch();
    vm.instantSmartSearch.showCounters         = false;
    vm.instantSmartSearch.enableSuggestedFoods = false;
    vm.instantSmartSearch.enableFreeform       = false;
    vm.instantSmartSearch.sources.self         = false;
    vm.instantSmartSearch.limits.branded       = 5;

    vm.instantSmartSearch.defaultToInput = true;
    vm.instantSmartSearch.select         = function (food) {
      this.selected = null;
      this.error    = null;

      let toState, toParams;

      if (food.$type === 'default') {
        toState  = 'site.itemsSearch';
        toParams = {
          q:    food.food_name,
          page: null
        };

      } else if (food.$type === 'phrase' || food.$type === 'freeform') {
        toState  = 'site.food';
        toParams = {
          natural_query: $filter('cleanurl')(food.food_name)
        };
      } else if (food.$type === 'branded') {
        toState  = 'site.itemsDetail';
        toParams = {
          brand:     $filter('cleanurl')(food.brand_name),
          item_name: $filter('cleanurl')(food.food_name),
          item_id:   food.nix_item_id
        };
      }

      Analytics.trackEvent('searchv2', vm.instantSmartSearch.$search, $state.href(toState, toParams));
      this.logStat(food);

      $state.go(toState, toParams);
    };

    vm.searchButtonClick = () => {
      if (vm.instantSmartSearch.items && vm.instantSmartSearch.items.length) {
        let food                       = vm.instantSmartSearch.items[0];
        vm.instantSmartSearch.selected = food;
        vm.instantSmartSearch.select(food);
      }
    };



    //
    // FUNCTIONS
    //

    vm.toggleSearchBar = function () {
      vm.navBarCollapsed = true;
      vm.searchBarCollapsed = !vm.searchBarCollapsed;
    };

    vm.toggleNavBar = function () {
      vm.searchBarCollapsed = true;
      vm.navBarCollapsed = !vm.navBarCollapsed;
    };

    //
    // LISTENERS
    //

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams) {
      vm.navBarCollapsed = true;
      vm.searchBarCollapsed = toState.name !== "site.itemsSearch" || !toParams.q;

      if (toState.name.substr(0, 4) === 'site') {
        vm.showSiteMenu = true;
        vm.showAccountMenu = false;
      } else if (
        toState.name === 'account.auth.create.step2' ||
        toState.name.substr(0, 7) === 'account' &&
        toState.name.substr(0, 12) !== 'account.auth' &&
        $state.current.name.substr(0, 13) !== 'account.login') {
        vm.showSiteMenu = false;
        vm.showAccountMenu = true;
      } else {
        vm.showSiteMenu = false;
        vm.showAccountMenu = false;
      }
    });

    vm.versionMonitor = versionMonitor;
  }

  //creates a focusMe directive.
  // this is a hack.Should probably find a more elegant way to put focus on without timeout.
  function focusMe($timeout, $parse) {
    return {
      link: function (scope, element, attrs) {
        let model = $parse(attrs.focusMe);

        function select() {
          return $timeout(function () {
            element[0].focus();
            element[0].setSelectionRange(0, 9999);
            element[0].focus();
          }, 1);
        }

        if (model() === 'focus') {
          element.on('focus', select);
        } else {
          scope.$watch(model, function (value) {
            if (value === true) {
              return select();
            }
          });
        }
      }
    };
  }

})();
