(function () {
  'use strict';

  angular
    .module('about')
    .controller('aboutCtrl', aboutCtrl);

  function aboutCtrl() {
    var vm = this;

    vm.employees = [{
      'name':        'Matt Silverman',
      'image':       'https://s3.amazonaws.com/cdn4-nutritionix/images/matt.jpg',
      'jobTitle':    'Managing Partner',
      'description': 'I ate at Buredo today!',
      'twitter':     '',
      'linkedin':    'https://www.linkedin.com/in/mattsilv'
    }, {
      'name':        'Daniel Zadoff',
      'image':       'https://s3.amazonaws.com/cdn4-nutritionix/images/danny.jpg',
      'jobTitle':    'Managing Partner',
      'description': 'I also ate at Buredo today!',
      'twitter':     '',
      'linkedin':    'https://www.linkedin.com/in/dannyzadoff'
    }, {
      'name':        'Janna dePorter, MS, RD',
      'image':       'https://s3.amazonaws.com/cdn4-nutritionix/images/janna.jpg',
      'jobTitle':    'Manager, Restaurant Platform',
      'description': '',
      'twitter':     '',
      'linkedin':    ''
    }, {
      'name':        'Paige Einstein, RD',
      'image':       'https://s3.amazonaws.com/cdn4-nutritionix/images/paige.jpg',
      'jobTitle':    'Director, Nutrition',
      'description': 'I also ate at Buredo today!',
      'twitter':     ''
    }, {
      'name':        'Samantha Hatton',
      'image':       'https://s3.amazonaws.com/cdn4-nutritionix/images/sam.jpg',
      'jobTitle':    'Product Manager',
      'description': 'I also ate at Buredo today!',
      'linkedin':    'https://www.linkedin.com/in/samanthahatton',
      'twitter':     ''
    }, {
      'name':        'Yurko Fedoriv',
      'image':       'https://s3.amazonaws.com/cdn4-nutritionix/images/yurko.jpg',
      'jobTitle':    'Platform Engineer',
      'description': 'I also ate at Buredo today!',
      'github':      'https://github.com/Yurko-Fedoriv',
      'linkedin':    'https://ua.linkedin.com/in/yuriifedoriv'
    },{
      'name':        'Leo Joseph Gajitos',
      'image':       'https://s3.amazonaws.com/cdn4-nutritionix/images/leo.jpg',
      'jobTitle':    'Platform Engineer',
      'description': 'I also ate at Buredo today!',
      'github':      'https://github.com/majin22',
      'linkedin':    'https://ph.linkedin.com/in/leejay22'
    }, {
      'name':        'Rommel Malang',
      'image':       'https://s3.amazonaws.com/cdn4-nutritionix/images/rommel.jpg',
      'jobTitle':    'Front-End Engineer',
      'description': 'I also ate at Buredo today!',
      'twitter':     ''
    }, {
      'name':        'Varun Gupta',
      'image':       'https://s3.amazonaws.com/cdn4-nutritionix/images/varun.jpg',
      'jobTitle':    'Director of Engineering',
      'description': 'im pretty cool',
      'twitter':     '',
      'github':      'https://github.com/vgupta16',
      'linkedin':    'https://www.linkedin.com/in/vgupta16'
    }, {
      'name':        'Leo Jester Gajitos',
      'image':       '/nix_assets/images/tey.jpg',
      'jobTitle':    'QA Engineer',
      'description': 'im pretty cool',
      'twitter':     '',
      'github':      'https://github.com/Pzykoh',
      'linkedin':     'https://ph.linkedin.com/in/TeyGajitos'
    }, {
      'name':        'Roman Doroschevici',
      'image':       'https://s3.amazonaws.com/cdn4-nutritionix/images/roman.jpg',
      'jobTitle':    'System Administrator',
      'description': '',
      'twitter':     ''
    }, {
      'name':        'Nick Petrov',
      'image':       '/nix_assets/images/nick.jpg',
      'jobTitle':    'Mobile Engineer',
      'description': '',
      'twitter':     ''
    },{
      'name':        'Magdiel Juma',
      'image':       '/nix_assets/images/magdiel.jpg',
      'jobTitle':    'Platform Engineer',
      'description': '',
      'twitter':     ''
    },{
      'name':        'Ashley Comparin',
      'image':       '/nix_assets/images/ashley.jpg',
      'jobTitle':    'Executive Assistant',
      'description': '',
      'twitter':     ''
    },{
      'name':        'Artem Sorokin',
      'image':       '/nix_assets/images/artem.jpg',
      'jobTitle':    'Platform Engineer',
      'description': '',
      'twitter':     ''
    },{
      'name':        'Evan Beal',
      'image':       '/nix_assets/images/evan.jpg',
      'jobTitle':    'Business Development Manager ',
      'description': '',
      'twitter':     '',
      'linkedin':     'https://www.linkedin.com/in/evan-beal-9a788a19/'
    },{
      'name':        'Julia Randall',
      'image':       '/nix_assets/images/julia.jpg',
      'jobTitle':    'Platform Engineer',
      'description': '',
      'twitter':     ''
    }];

    vm.founders = vm.employees.splice(0, 2);
    vm.employees = vm.founders.concat(_.shuffle(vm.employees));
  }
})();
