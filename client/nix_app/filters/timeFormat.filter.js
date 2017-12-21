(function () {
  'use strict';

  angular
    .module('nutritionix')
    .filter('formatTime', function () {
       return function (val) {
         if (val < 60) {
           if (val == 1) {
             return val.toString() + ' second ago';
           }  else {
             return val.toString() + ' seconds ago';
           }
         } else if (val >= 60 && val < 120){
           return '1 min ago';
         } else {
           return (val/60).toFixed(0).toString() + ' mins ago';
         }
       }
    });

}());
