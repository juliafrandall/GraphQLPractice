(function () {
  'use strict';

  angular
    .module('ads')
    .directive('adsPageLevel', ads);

  function ads(ServicesFactory) {
    return {
      restrict: 'EA',
      replace: true,
      template: '<div>',
      link: function () {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({
            google_ad_client:      "ca-pub-0702230774116001",
            enable_page_level_ads: true
          });
        } catch (e) { }
      }
    };
  }
}());
