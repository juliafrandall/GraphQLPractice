(function () {
  'use strict';

  angular
    .module('nixy')
    .directive('nixy', nixyDirective);

  function nixyDirective($timeout, nixy, $localStorage) {
    return {
      restrict:     'EA',
      replace:      true,
      scope:        {},
      templateUrl:  '/nix_app/nixy/nixy.html',
      controllerAs: 'vm',
      controller:   function ($scope, moment, $log, $location) {
        const vm = this;

        vm.input = '';
        vm.chat  = [];

        vm.handleUserMessage = () => {
          if (vm.input) {
            vm.chat.push({
              text:   vm.input,
              sender: 'user'
            });
            const input = vm.input;
            vm.input    = '';

            vm.$busy = true;

            nixy.sendMessage(input)
              .then(data => {
                vm.chat.push({
                  text:   data.message || 'Sorry, I did not understand you',
                  sender: 'bot'
                })

              })
              .catch((/*error*/) => {
                vm.chat.push({
                  text:   'Unexpected error :(',
                  sender: 'bot',
                  style:  'error'
                })
              })
              .finally(() => {
                vm.$busy = false;
              });
          }
        };

        nixy.settings.then(settings => {
          if (settings.initialMessage) {
            vm.chat.push({
              text:   settings.initialMessage,
              sender: 'bot'
            });
          }

          let randomNumber = _.random(1, 100);
          vm.showNixy      = randomNumber <= settings.displayProbability;
          $log.debug(randomNumber, '<=', settings.displayProbability, '=', vm.showNixy);

          let day     = moment.tz('America/New_York').format('ddd');
          vm.showNixy = vm.showNixy && settings.displayDays.indexOf(day) > -1;
          $log.debug(day, 'in', settings.displayDays, '=', vm.showNixy);

          let hour    = moment.tz('America/New_York').format('H');
          vm.showNixy = vm.showNixy && hour >= settings.displayHours.begin && hour < settings.displayHours.end;
          $log.debug(settings.displayHours.begin, '<=', hour, '<', settings.displayHours.end, '=', vm.showNixy);

          if ($location.absUrl().toLowerCase().indexOf('forcenixy') > -1) {
            vm.showNixy = true;
          }
        });

      },
      link:         function (scope, element, attributes, vm) {
        vm.expand = false;

        let browser = (new UAParser()).getResult();
        let isIos   = false;

        if (browser.device.vendor === 'Apple' && browser.device.type === 'mobile') {
          isIos = true;
        }

        let initialChatHeight = 350;

        // this is needed for input focus to work on mobile safari
        nixy.settings.then(() => $timeout(() => {
          if (vm.showNixy) {
            const collapsed = element.find('.nixy-collapsed');
            const expanded  = element.find('.nixy-expanded');
            const header    = element.find('.nixy-header');
            const chatInput = element.find('#chat-input');

            const expandNixy = () => {
              expanded.show();
              collapsed.hide();
              chatInput.focus();

              vm.expand = true;
            };

            const collapseNixy = () => {
              expanded.hide();
              collapsed.show();

              vm.expand = false;
            };

            let closeHandlerEnabled = true;
            if (isIos) {
              chatInput.on('focus', e => {
                closeHandlerEnabled = false;
              });

              chatInput.on('blur', e => {
                $timeout(() => closeHandlerEnabled = true, 50);
              });
            }

            header.on('click touch', e => {
              // header click handler is messed up when keyboard is opened on ios. Let's not do anything
              if (!closeHandlerEnabled) {return;}

              e.preventDefault();
              e.stopPropagation();

              collapseNixy();

              scope.$apply();

              $localStorage.nixyUserClosed = true;
            });

            collapsed.on('click touch', e => {
              e.preventDefault();
              e.stopPropagation();

              expandNixy();

              scope.$apply();
            });

            scope.$watch(() => angular.element(window).height(), height => {
              let container = element.find('.chatCont');

              if (isIos) {
                height = height * 0.35;
              } else {
                height = height - 150;
              }


              container.css('height', _.min([height, initialChatHeight]));
              container[0].scrollTop = container[0].scrollHeight;
            });

            scope.$watch('vm.chat.length', function scrollToBottomOfResults(chatLength) {
              if (chatLength > 0) {
                $timeout(() => {
                  const terminalResultsDiv = element.find('#chatCont')[0];
                  if (terminalResultsDiv) {
                    terminalResultsDiv.scrollTop = terminalResultsDiv.scrollHeight;
                  }
                });
              }
            });

            $timeout(() => {
              if (!$localStorage.nixyUserClosed && !browser.device.type) {
                expandNixy();
              }
            }, 10000)
          }
        }));
      }
    }
  }
}());
