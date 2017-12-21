(function () {
  'use strict';

  angular.module('account.lists', ['ngTagsInput'])
    .config(config)
    .factory('listFocusNutrients', function ($filter) {
      const nutrients = [
        {id: 208, label: 'Calories'},
        {id: 204, label: 'Fat'},
        {id: 203, label: 'Protein'},
        {id: 269, label: 'Sugar'},
        {id: 606, label: 'Saturated Fat'},
        {id: 291, label: 'Fiber'},
        {
          id:       -205,
          label:    'Net Carbs',
          getValue: function (item) {
            let carbs = $filter('nutrient')(item.full_nutrients, 205, 'value');
            let fiber = $filter('nutrient')(item.full_nutrients, 291, 'value');

            if (carbs === null || fiber === null) {
              return null;
            }

            return carbs - fiber;
          }
        },
        {id: 205, label: 'Total Carbohydrates'},
        {id: 307, label: 'Sodium'},
        {id: 601, label: 'Cholesterol'},
        {id: 306, label: 'Potassium'},
        {id: 318, label: 'Vitamin A'},
        {id: 418, label: 'Vitamin B12'},
        {id: 401, label: 'Vitamin C'},
        {id: 324, label: 'Vitamin D'},
        {id: 323, label: 'Vitamin E'},
        {id: 301, label: 'Calcium'},
        {id: 303, label: 'Iron'}
      ];

      nutrients.byId = {};
      nutrients.forEach(n => {
        nutrients.byId[n.id] = n;

        if (!n.getValue) {
          n.getValue = function (item) {
            return $filter('nutrient')(item.full_nutrients, this.id, 'value');
          };
        }
      });

      return nutrients;
    })
    .factory('listDuplicator', function ($localStorage, $timeout) {
      return {
        push: function (list) {
          return $timeout(() => $localStorage.list_duplicate = _.pick(list, [
            // 'name', 'description',
            'is_published',
            'items', 'labels',
            'nutrient_focus',
            'photo',
            'serving_weight_grams', 'sort'
          ]), 100);
        },
        pull: function () {
          const tmp                    = $localStorage.list_duplicate;
          $localStorage.list_duplicate = null;
          return tmp;
        }
      };
    });

  function config($stateProvider) {
    $stateProvider
      .state('account.cabinet.lists', {
        url:      '/me/lists',
        abstract: true,
        template: '<div ui-view></div>',
        data:     {
          cssClass: 'account logged-in'
        }
      })
      .state('account.cabinet.lists.list', {
        url:         '',
        metaTags:    {
          title:       'Public Lists',
          description: 'Public Lists'
        },
        controller:  'AccountListsListCtrl',
        templateUrl: '/nix_app/account/lists/list.html'
      })
      .state('account.cabinet.lists.new', {
        url:         '/new',
        controller:  'AccountSaveListCtrl',
        templateUrl: '/nix_app/account/lists/save.html',
        metaTags:    {
          title: 'Create new public list'
        },
        resolve:     {
          list: () => null,
          listLabels: listLabelsService => listLabelsService.get()
        },
        data:        {
          cssClass: 'account logged-in save'
        }
      })
      .state('account.cabinet.lists.edit', {
        url:         '/:id',
        metaTags:    {
          title:       '{{list.name | ucwords}} - edit',
          description: '{{list.name | ucwords}} - edit'
        },
        controller:  'AccountSaveListCtrl',
        templateUrl: '/nix_app/account/lists/save.html',
        data:        {
          cssClass: 'account logged-in save'
        },
        resolve:     {
          list:       function (nixTrackApiClient, $stateParams, $state, listLabelsService) {
            return nixTrackApiClient(`/public_lists/${$stateParams.id}`)
              .then(response => listLabelsService.updateListLabelData(response.data))
              .catch(() => $state.go('site.404'));
          },
          listLabels: listLabelsService => listLabelsService.get()
        }
      });
  }
}());
