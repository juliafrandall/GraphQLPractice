(function () {
  'use strict';

  angular.module('account.lists')
    .controller('AccountListsListCtrl', AccountListsListCtrl);

  function AccountListsListCtrl($scope, nixTrackApiClient) {
    let vm = $scope.vm = this;

    (function fetch(lists = [], limit = 300, offset = 0) {
      return nixTrackApiClient('/public_lists', {params: {limit, offset}})
        .then(response => {
          lists = lists.concat(response.data.public_lists);

          if (response.data.public_lists.length === limit) {
            return fetch(lists, limit, offset + limit);
          }

          return lists;
        });
    }())
      .then(lists => vm.lists = lists);
  }
}());
