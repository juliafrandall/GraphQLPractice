(function () {
  'use strict';

  angular
    .module('items')
    .directive('hasSchema', function () {
      return {
        restrict: 'A',
        scope:    {
          item: '=hasSchema'
        },
        link: function(scope, elem, attr) {
            scope.$watch('item', function(item){

              var schemaAttrs = ['itemscope','itemtype','itemprop','content'];

              if(item == 3) {
                for (var ctr in schemaAttrs) {
                  if(attr[schemaAttrs[ctr]]) {
                    elem.removeAttr(schemaAttrs[ctr]);
                  }
                }
              }

            });
        }
      }
    });

})();




