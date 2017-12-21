(function () {
  'use strict';

  angular.module('account.recipes')
    .controller('AccountRecipesListCtrl', AccountRecipesListCtrl);

  function AccountRecipesListCtrl($scope, nixTrackApiClient) {
    let vm = $scope.vm = this;

    (function fetch(recipes = [], limit = 300, offset = 0) {
      return nixTrackApiClient('/recipe', {params: {limit, offset}})
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
}());
