(function () {
  'use strict';

  angular
    .module('nutritionix')
    .filter('displayhtml',function ($sce){
        return function (input){
            return $sce.trustAsHtml(input);
        }
    });

}());
