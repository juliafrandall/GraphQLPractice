'use strict';

const _ = require('lodash');

const logger = {
  log: function () {
    console.log.apply(console, this.prepareValues(arguments));
  },

  error: function () {
    console.error.apply(console, this.prepareValues(arguments));
  },

  prepareValues: function (values) {
    if (process.env.NODE_ENV !== 'production') {
      return values;
    }

    return _.map(values, function (value) {
      if (_.isObject(value)) {
        let string;

        if (_.isFunction(value)) {
          string = value.toString();
        } else if (value.stack) {
          string = value.stack
        } else {
          return value;
        }

        return string.replace(/\n/g, '\\n');
      } else {
        return value;
      }
    })
  }
};

module.exports = logger;
