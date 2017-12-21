'use strict';

angular.module('ui.bootstrap.pagination')
  .controller('NixPaginationController', function ($rootScope, $scope, $attrs, $parse, $controller, $state) {
    $scope.getPaginationHref = function (page) {
      if ($scope.state) {
        const params = angular.copy($state.params);
        params.page  = page > 1 ? page : null;
        angular.extend(params, $scope.state.params || {});

        angular.forEach(params, function (value, key) {
          if (angular.isFunction(value)) {
            params[key] = value(page);
          }
        });

        return $state.href(page === 1 && $scope.state.nameFirstPage || $scope.state.name, params)
          .replace(/\/$/, '')
      }

      if ($scope.hrefPattern) {
        return $scope.hrefPattern
          .replace(/\[(.*{page})]/, page > 1 ? '$1' : '')
          .replace('{page}', page);
      }

      return null;
    };

    const controller = $controller('PaginationController', {
      $scope: $scope,
      $attrs: $attrs,
      $parse: $parse
    });


    $scope.$watch('page', function (page) {
      if (!angular.isUndefined(page)) {
        $rootScope.rel = {
          prev: $scope.noPrevious() ? null : $scope.getPaginationHref(page - 1),
          next: $scope.noNext() ? null : $scope.getPaginationHref(page + 1)
        };
      }
    });

    $scope.$on('$destroy', function () {
      $rootScope.rel = null;
    });

    return controller;
  });


angular.module('ui.bootstrap.pagination')
  .decorator('paginationDirective', ['$delegate', function ($delegate) {
    $delegate[0].controller = 'NixPaginationController';

    $delegate[0].$$isolateBindings['state'] = {
      attrName: 'state',
      mode:     '=',
      optional: true
    };

    $delegate[0].$$isolateBindings['hrefPattern'] = {
      attrName: 'hrefPattern',
      mode:     '=',
      optional: true
    };

    return $delegate;
  }]);

angular.module('ui.bootstrap.pagination')
  .directive('paginationInfo', function () {
    return {
      template: '<pre class="text-center">' +
                'Showing ' +
                '{{ 1 + (itemsPerPage * (currentPage - 1))}} - ' +
                '{{itemsPerPage * currentPage < totalItems ? currentPage * itemsPerPage  : totalItems}} ' +
                'of {{totalItems}}' +
                '</pre>',
      restrict: 'AE',
      scope:    {
        totalItems:   '=',
        currentPage:  '=',
        itemsPerPage: '='
      }
    }
  });

angular.module("template/pagination/pagination.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("template/pagination/pagination.html",
    "<ul class=\"pagination\">\n" +
    "  <li ng-if=\"::boundaryLinks\" ng-class=\"{disabled: noPrevious()||ngDisabled}\" class=\"pagination-first\"><a ng-href='{{getPaginationHref(1)}}' ng-click=\"selectPage(1, $event)\">{{::getText('first')}}</a></li>\n" +
    "  <li ng-if=\"::directionLinks\" ng-class=\"{disabled: noPrevious()||ngDisabled}\" class=\"pagination-prev\"><a rel='prev' ng-href='{{getPaginationHref(page - 1)}}' ng-click=\"selectPage(page - 1, $event)\">{{::getText('previous')}}</a></li>\n" +
    "  <li ng-repeat=\"pageModel in pages track by $index\" ng-class=\"{active: pageModel.active,disabled: ngDisabled&&!pageModel.active}\" class=\"pagination-page\"><a rel='{{page - 1 == pageModel.number && \"prev\" || page + 1 == pageModel.number && \"next\" || null}}' ng-href='{{getPaginationHref(pageModel.number)}}' ng-click=\"selectPage(pageModel.number, $event)\">{{pageModel.text}}</a></li>\n" +
    "  <li ng-if=\"::directionLinks\" ng-class=\"{disabled: noNext()||ngDisabled}\" class=\"pagination-next\"><a rel='next' ng-href='{{getPaginationHref(page + 1)}}' ng-click=\"selectPage(page + 1, $event)\">{{::getText('next')}}</a></li>\n" +
    "  <li ng-if=\"::boundaryLinks\" ng-class=\"{disabled: noNext()||ngDisabled}\" class=\"pagination-last\"><a ng-href='{{getPaginationHref(totalPages)}}' ng-click=\"selectPage(totalPages, $event)\">{{::getText('last')}}</a></li>\n" +
    "</ul>\n" +
    "");
}]);
