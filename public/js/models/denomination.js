'use strict';

define([
  'underscore',
  'backbone',
  'require',
  'models/currency'
], function(_, Backbone, require, Currency) {
  var DECIMAL_POINTS = 2

  var DenominationModel = Backbone.Model.extend({
    defaults: {
      currencyCode: undefined,
      type: undefined,
      value: undefined
    },

    currency: function() {
      var Currencies = require('collections/currencies')
      return Currencies.where({code: this.get('currencyCode')})[0]
    },

    valueFormatted: function() {
      return this.get('value') < 1 ? this.get('value').toFixed(DECIMAL_POINTS).toString().replace(/0\.0?(\d{1,2})/g, '$1') : this.get('value')
    },

    worthIn: function(currency) {
      var Currencies = require('collections/currencies')

      var worth = this.get('value') *
        Currencies.where({code: this.get('currencyCode')})[0].get('worth') /
        (currency instanceof String ? Currencies.where({code: currency})[0].get('worth') : currency.get('worth'))

      return worth.toFixed(DECIMAL_POINTS) !== 0.00 ? worth.toFixed(DECIMAL_POINTS) : 0.01
    }
  })

  return DenominationModel
})
