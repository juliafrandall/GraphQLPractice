'use strict';

angular.module('nutritionix')
  .factory('messages', function ($rootScope, user, nixTrackApiClient, $timeout, $state, $q) {
    let messagesService = {
      messages:       [],
      getUnreadCount: function () {
        let count = 0;
        this.messages.forEach(message => {
          if (!message.viewed) {
            count += 1;
          }
        });

        return count;
      },
      update:         function () {
        if (!this.update.$promise) {
          this.update.$promise = nixTrackApiClient('/messages')
            .success(response => {
              messagesService.messages = response.messages;
            })
            .finally(() => {this.update.$promise = null;});
        }

        return this.update.$promise;
      },
      getMessage:     function (id, setViewed) {
        return this.update().then(() => {
          let message = _.find(this.messages, {id});

          if (message && setViewed && !message.viewed) {
            message.viewed = 1;

            nixTrackApiClient('/messages/update', {
              method: 'PUT',
              data:   {
                messages: [{
                  id,
                  viewed: 1
                }]
              }
            }).success(() => {this.update();})
          }

          return message;
        });
      },
      archiveMessage: function (message) {
        if (message) {
          let id = angular.isString(message) ? message : message.id;

          return nixTrackApiClient('/messages/update', {
            method: 'PUT',
            data:   {
              messages: [{
                id,
                deleted: 1
              }]
            }
          }).success(() => {this.update();})
        }

        return $q.reject(false);
      }
    };

    function checkMessages() {
      if (checkMessages.getIsEnabled()) {
        messagesService.update();
        // .finally(() => { $timeout(checkMessages, 30000); })
      }
    }

    checkMessages.getIsEnabled = () => {
      return user.getIsAuthenticated() && $state.current.name.substr(0, 7) === 'account';
    };

    $rootScope.$watch(() => checkMessages.getIsEnabled(), enabled => {
      if (enabled) {
        checkMessages();
      }
    });

    return messagesService;
  });
