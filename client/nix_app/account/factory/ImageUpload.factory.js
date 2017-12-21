angular.module('account')
  .factory('ImageUpload', function ($http, $q, user, nixTrackApiClient) {
    function ImageUpload(entity) {
      this.entity = entity;
      this.clear();
    }

    angular.extend(ImageUpload.prototype, {
      clearUpload:  function () {
        this.file           = null;
        this.backupFile     = null;
        this.invalidFile    = null;
        this.submitOnChange = false;
      },
      clearSubmit:  function () {
        this.urls   = {};
        this.$error = null;
      },
      clear:        function () {
        this.clearUpload();
        this.clearSubmit();
      },
      onChange:     function () {
        if (!this.file && this.backupFile) {
          this.file = this.backupFile;
        } else if (this.submitOnChange) {
          this.submit();
        }
      },
      _submit:      function (uploadId, entity = this.entity) {
        if (!this.file) { return $q.resolve(null); }

        this.clearSubmit();

        return $http({
          url:     nixTrackApiClient.getApiEndpoint(true) + `/upload/image/${entity || '-'}/${uploadId || '-'}`,
          method:  'POST',
          headers: {
            'Content-Type': this.file.type,
            'x-user-jwt':   user.get('jwt')
          },
          data:    this.file
        })
          .then(response => this.urls = response.data)
          .catch(response => $q.reject(this.$error = response.data));
      },
      submit:       function (uploadId, entity = this.entity) {
        return this._submit(uploadId, entity);
      },
      beforeChange: function () {
        if (this.file) {
          this.backupFile = this.file;
        }
      }
    });

    return ImageUpload;
  });
