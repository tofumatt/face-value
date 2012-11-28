'use strict';

define([
  'underscore',
  'backbone',
  'require',
  'currency-data',
  'models/currency'
], function(_, Backbone, require, CurrencyData, Currency) {
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
      var worth

      // Supplying strings to this method is allowed; we just do the lookup
      // when it's called, if that's the case.
      if (currency instanceof String) {
        currency = Currencies.where({code: currency})[0]
      }

      // If we're converting from our reference currency (usually USD) to
      // another currency, just multiply the value of this denomination by
      // it's worth in said currency.
      if (this.get('currencyCode') === CurrencyData.REFERENCE_CURRENCY) {
        worth = this.get('value') * currency.get('worth')
      }

      // If we're converting _to_ our reference currency (usually USD), use
      // the basic inverse rate of the denomination's currency.
      if (currency.get('code') === CurrencyData.REFERENCE_CURRENCY) {
        worth = this.get('value') * (1 / currency.get('worth'))
      }

      // For any other conversion (between two currencies, neither of which are
      // our reference currency), we do relative exchange rates between two
      // currencies, then multiple the value of this denomination by the result.
      worth = this.get('value') * (currency.get('worth') * (1 / this.currency().get('worth')))

      return worth.toFixed(DECIMAL_POINTS) !== 0.00 ? worth.toFixed(DECIMAL_POINTS) : 0.01
    }
  })

  return DenominationModel
})
