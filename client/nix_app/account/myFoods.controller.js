(function () {
  'use strict';

  angular
    .module('account')
    .controller('MyFoodsCtrl', MyFoodsCtrl);

  function MyFoodsCtrl($scope, nixTrackApiClient, $state, user, $filter) {
    const vm = $scope.vm = this;

    vm.user = user.getUserProfile();

    vm.search = {
      food_name: '',
      source:    $state.params.show ? ({'all': undefined, 'custom': 9})[$state.params.show] : 4
    };

    vm.getItemLink = item => {
      // ui-sref="{{recipe.source === 9 ? 'account.cabinet.editCustomFood({id: recipe.id})' : 'site.recipes.edit({id: recipe.id})'}}"
      if (item.source === 9) {
        return $state.href('account.cabinet.editCustomFood', {id: item.id});
      }

      if (item.source === 4) {
        return $state.href('site.recipes.edit', {id: item.id});
      }

      return $state.href('site.food', {
        natural_query: $filter('cleanurl')(item.food_name),
        serving:       $filter('cleanurl')(`${item.serving_qty} ${item.serving_unit.replace(/\(.*\)/, '').trim()}`)
      });
    };

    $scope.$watch('vm.search.source', (newVal, oldVal) => {
      if (newVal !== oldVal) {
        $state.go(
          $state.current.name,
          {show: _.isUndefined(newVal) ? 'all' : ({4: undefined, 9: 'custom'})[newVal]},
          {
            // prevent the events onStart and onSuccess from firing
            notify:   false,
            // prevent reload of the current state
            reload:   false,
            // replace the last record when changing the params so you don't hit the back button and get old params
            location: 'replace',
            // inherit the current params on the url
            inherit:  true
          }
        )
      }
    });

    (function fetch(recipes = [], limit = 300, offset = 0) {
      return nixTrackApiClient('/recipes', {params: {limit, offset}})
        .then(response => {
          recipes = recipes.concat(response.data.recipes);

          if (response.data.recipes.length === limit) {
            return fetch(recipes, limit, offset + limit);
          }

          return recipes;
        });
    }())
      .then(recipes => vm.recipes = recipes);
  }
})();
