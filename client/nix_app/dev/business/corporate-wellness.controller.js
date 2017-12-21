(function () {
  'use strict';

  angular
    .module('dev')
    .controller('CorporateWellnessCtrl', CorporateWellnessCtrl);

  function CorporateWellnessCtrl($scope, $http, vcRecaptchaService, Analytics, $timeout, stats, $filter) {
    const vm = $scope.vm = this;

    vm.subscribeForm = vm.contactForm = null;

    vm.initModel     = () => {
      vm.model = {
        subject: '',
        name:    '',
        email:   '',
        phone:   '',
        message: ''
      };
    };

    vm.initModel();

    vm.recaptcha = {
      response: null,
      widgetId: null
    };

    vm.contact = () => {
      Analytics.trackEvent('button', 'click', 'contact');

      vm.contact.$error = vm.contact.$success = null;
      vm.contactForm.$submitted = true;

      if (vm.contactForm.$valid) {
        vm.contact.$busy = true;

        $http.post('/email/secure', {
            message:   `
              From: ${vm.model.name} <${vm.model.email}>
              Message: ${vm.model.message}
            `.split('\n').map(r => r.trim()).join('\n'),
            name:      vm.model.name,
            subject:   'Nutrition & Exercise API contact form',
            email:     vm.model.email,
            recaptcha: vm.recaptcha.response
          }, {ignore500: true})
          .then(function () {
            vm.initModel();
            vm.contact.$success = "We'll be in contact shortly!";
            vm.contactForm.$setPristine();
          })
          .catch(function (response) {
            if (angular.isString(response.data)) {
              vm.contact.$error = response.data;
            } else if (angular.isObject(response.data) && response.data.message) {
              vm.contact.$error = response.data.message;
            } else {
              vm.contact.$error = 'Unexpected backend error';
            }
          })
          .finally(() => {
            vm.contactForm.$submitted = null;
            vcRecaptchaService.reload(vm.recaptcha.widgetId);
            vm.contact.$busy = false;
          })
      } else {
        angular.forEach(vm.contactForm, function (property, key) {
          if (key[0] !== '$' && property.$invalid) {
            property.$setDirty();
          }
        });
      }
    };

    vm.planInclusive = [{
      name:        'Dietitian On-Demand',
      description: `Our wellness solution is developed and supported by registered 
                    dietitians who are passionate about making people lead healthier lives.`,
      icon:        '<i class="fa fa-2x fa-flask"></i>',
      //linkText:    'Try a live demo!',
      //link:        '/natural-demo?q=for%20breakfast%20i%20ate%203%20eggs,%20bacon%20and%20cheese'
    },
      {
        name:        'Health Education',
        description: `One of our registered dietitians guide your employees through essential 
                      nutrition and fitness knowledge to set them up for sucess.`,
        icon:        '<i class="fa fa-2x fa-graduation-cap"></i>',
        //linkText: 'Learn More',
        link:        '#'
      },
      /*
      {
          name: 'Barcode Scanning',
          description: `Cumque incidunt laudantium deserunt nulla asperiores fugiat reprehenderit
                        adipisci repudiandae autem eaque! Quod qui dolorem ducimus animi,
                        ex dicta odit error itaque.`,
          icon: '<i class="fa fa-2x fa-barcode"></i>',
          linkText: 'Learn More',
          lin
          */
      {
        name:        'Real-time Guidance',
        description: `Our registered dietitian team is made available to answer your employee\'s nutrition questions.
                      It\'s like having your own in-house nutrition department.
                     `,
        icon:        '<i class="fa fa-2x fa-comments"></i>',
        linkText:    'Learn More',
        link:        '/database'
      },
      {
        name:        'Mobile App',
        description: `Employees use our state-of-the-art mobile app to track and record their health.`,
        icon:        '<i class="fa fa-2x fa-mobile"></i>',
        linkText:    'Try our App',
        link:        '/app'
      },
      {
        name:        'Sync With Other Apps',
        description: `We employ a full-time team of registered dietitians to help us
                      verify our data and API procedures to ensure we can provide
                      the strongest possible nutrition solution for your app.
                      `,
        icon:        '<i class="fa fa-2x fa-refresh"></i>',
        //linkText: 'Learn More',
        link:        '#'
      },
      {
        name:        'Team Challenges',
        description: `We use gamification to keep employees interested and engaged in improving their health.`,
        icon:        '<i class="fa fa-2x fa-trophy"></i>',
        //linkText:    'Try a live demo!',
        //link:        '/restaurant-map'
      }
    ];


    vm.features = [
      {
        attribute: 'mau', label: '# Employees', tooltip: `An active user is defined as an end-user who makes
                                                                an API request within a 30 day time period.`
      },
      {
        attribute: 'onboarding', label: 'Onboarding', tooltip: `We hold a weekly onboarding webinars to get new and existing employees trained 
                                                                      on how to effectively use the platform.`
      },
      {
        attribute: 'hours', label: 'Consultation Hours Included', tooltip: `Number of hours included in your plan per month where our registered dietitians 
                                                                    answer employee dietary questions.`
      }

    ];

    vm.plans = [
      

      {
        'name':       'Starter',
        'price':      `
          <sup>$</sup>299
          <sub>per month</sub>`,
        'features':   {
          mau:        '<20',
          onboarding:   '<i class="fa fa-2x fa-check"></i>',
          hours:   '<i class="fa fa-2x fa-times"></i>'
          
        },
        'buttonText': 'Sign Up Now',
        'buttonLink': 'https://payment.nutritionix.com/'
      },
      {
        'name':       'Silver',
        'price':      `
          <sup>$</sup>5
          <sub>per user</sub>`,
        'features':   {
          mau:        '20+',
          onboarding:   '<i class="fa fa-2x fa-check"></i>',
          hours:   '<i class="fa fa-2x fa-times"></i>'
        },
        'buttonText': 'Sign Up Now',
        'buttonLink': 'https://payment.nutritionix.com/'
      },
      {
        'name':       'Gold',
        'price':      `
          <sup>$</sup>8
          <sub>per user</sub>`,
        'features':   {
          mau:        '&infin;',
          onboarding:   '<i class="fa fa-2x fa-check"></i>',
          hours:   '&infin;'
        },
        'buttonText': 'Sign Up Now',
        'buttonLink': 'https://payment.nutritionix.com/'
      },
      {
        'name':       'Unicorn',
        'price':      `
          <span>as low as</span>
          <sup>$</sup>3
          <sub>user/month</sub>`,
        'term':       'user/month',
        'features':   {
          mau:        '80+',
          onboarding:   '<i class="fa fa-2x fa-check"></i>',
          hours:   'unlimited'
        },
        'buttonText': 'Contact Us',
        'buttonLink': '#contact-form'
      }
    ];
  }
})();
