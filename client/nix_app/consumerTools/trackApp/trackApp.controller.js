(function () {
  'use strict';

  angular
    .module('trackApp')
    .controller('trackAppCtrl', trackApp2Ctrl);

  function trackApp2Ctrl($scope, $anchorScroll, $http, stats, vcRecaptchaService) {
    const vm = this;

    vm.stats = stats;

    vm.slide = {
      previous  : 0,
      current   : 0,
      next      : 0
    };

    vm.slickInit = false;

    // Screens
    vm.slickScreens = {
        arrows          : false,
        speed           : 1000
    };

    // Features
    vm.slickHighlights = {
        asNavFor        : "#screens",
        waitForAnimate  : false,
        arrows          : false,
        dots            : true,
        vertical        : true,
        autoplay        : true,
        autoplaySpeed   : 6000,
        slidesToScroll  : 1,
        slidesToShow    : 4,
        speed           : 1000,
        focusOnSelect   : true,
        event: {
            beforeChange: function (event, slick, currentSlide, nextSlide) {
              vm.slide.previous = currentSlide;
              vm.slide.next = nextSlide;
            },
            afterChange: function (event, slick, currentSlide, nextSlide) {
              vm.slide.current = currentSlide;
            },
            init: function (event, slick) {
              vm.slickInit = true;
            }
        },
        mobileFirst     : true,
        respondTo       : 'window',
        responsive      : [
          {
            breakpoint  : 1200,
            settings    : {
              vertical        : true,
              slidesToShow    : 4
            }
          },
          {
            breakpoint  : 767,
            settings    : {
              vertical        : true,
              slidesToShow    : 4
            }
          },
          {
            breakpoint  : 666,
            settings    : {
              vertical        : false,
              centerMode      : true,
              centerPadding   : '160px',
              slidesToShow    : 1
            }
          },
          {
            breakpoint  : 567,
            settings    : {
              vertical        : false,
              centerMode      : true,
              centerPadding   : '120px',
              slidesToShow    : 1
            }
          },
          {
            breakpoint  : 374,
            settings    : {
              vertical        : false,
              centerMode      : true,
              centerPadding   : '40px',
              slidesToShow    : 1
            }
          },
          {
            breakpoint  : 319,
            settings    : {
              vertical        : false,
              centerMode      : true,
              centerPadding   : '15px',
              slidesToShow    : 1
            }
          }
        ]
    };

    // Quotes
    vm.quotes = [
      {
        'text': 'I love the application used in conjunction with Amazon Echo and my iPhone. This is the first time in years that I have been able to lose real weight.',
        'author': 'Marie D.'
      },
      {
        'text': 'I love how easy it is to enter the foods I eat in a snap! Also, I love the different ethnic foods/dishes available - I travel a lot. Thanks!',
        'author': 'Sylvia K.'
      },
      {
        'text': 'I am really enjoying the app. All I need to do to log something is type in what I ate, and it magically figures out how many calories it is. Great work!',
        'author': 'Dylan W.'
      },
      {
        'text': 'I love this app!!! It\'s the only food log I\'ve actually kept up with for this long. It is so easy to use!',
        'author': 'Jamie S., Philadelphia, PA'
      },
      {
        'text': 'I reached my 15 pound weight loss goal thanks to the Nutritionix app keeping me honest about my calorie consumption. I have decided to lose a couple more pounds and then use the app to keep me from regaining the weight. So glad that I stumbled upon this app!',
        'author': 'Jeanne T., Austin, TX'
      }
    ];


    vm.features = [{
        'screen'  : 'https://d2eawub7utcl6.cloudfront.net/assets/track_smartsearch.png',
        'title'   : 'Smart Search',
        'text'    : 'Easily search across Grocery, Restaurant, History, and Common Foods all from one location for logging faster than ever.'
      },
      {
        'screen'  : 'https://d2eawub7utcl6.cloudfront.net/assets/track_predictiveresults.png',
        'title'   : 'Predictive Results',
        'text'    : 'Predictive search suggests your foods based on the time of day.'
      },
      {
        'screen'  : 'https://d2eawub7utcl6.cloudfront.net/assets/track_freeform.png',
        'title'   : 'Freeform',
        'text'    : 'Powered by our Natural Language Technology, Freeform mode enables you to speak or type freely into the app, and Track takes care of the rest!'
      },
      {
        'screen'  : 'https://d2eawub7utcl6.cloudfront.net/assets/track_userfriendly.png',
        'title'   : 'User-friendly database created by Registered Dietitians',
        'text'    : 'Plus access to over 600K verified restuarant + grocery branded foods.'
      },
      {
        'screen'  : 'https://d2eawub7utcl6.cloudfront.net/assets/track_createrecipes.png',
        'title'   : 'Create Recipes',
        'text'    : 'Build custom recipes that you can go back and edit for future logging.'
      },
      {
        'screen'  : 'https://d2eawub7utcl6.cloudfront.net/assets/track_mycoach.png',
        'title'   : 'Share Your Food Log with the Coach Portal',
        'text'    : 'Share your food log with a dietitian, trainer or other coach. With the Coach Portal, your coach can then review your log in real time!'
      }
    ];

    vm.fade = function(i) {

      if (vm.slickInit) {
        let className = '';

        if((vm.slide.previous == i && vm.slide.next != 0) ||
          (vm.slide.previous == (vm.features.length - 1) && vm.slide.next == 0)) {
          className = 'fade-out';
        }

        if((vm.slide.next == i)) {
          className = 'fade-in';
        }

        return className;

      }
    };

    vm.recaptcha = {
      response: null,
      widgetId: null
    };

    vm.phone = null;
    vm.sendAppLink = () => {
      if ($scope.form && $scope.form.$valid) {
        $http.post('/sms/send-app-link', {phone: vm.phone, recaptcha: vm.recaptcha.response})
          .then(() => {
            vm.sendAppLink.$success = true;
            vm.phone = null;
            vm.focus = true;
          })
          .catch(response => {vm.sendAppLink.$error = response.data;})
          .finally(() => {
            $scope.form.$setPristine();
            vcRecaptchaService.reload(vm.recaptcha.widgetId);
          });
      }
    };

    vm.sendAppLink.clearMessages = () => {
      vm.sendAppLink.$success = null;
      vm.sendAppLink.$error = null;
    };




  }

})();
