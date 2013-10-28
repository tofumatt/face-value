'use strict';

define([
  'underscore',
  'backbone',
  'backbone_store',
  'collections/denominations',
  'models/currency'
], function(_, Backbone, Store, DenominationsCollection, Currency) {
  var CurrenciesCollection = Backbone.Collection.extend({
    model: Currency,

    localStorage: new Store('Currencies'),

    // Sort currencies by their actual name and not their ISO code.
    // Some currencies have weird codes that make lists seem odd (eg Swiss
    // Franc is CHF).
    comparator: function(currency) {
      return currency.get('name')
    },

    coins: function(code, range) {
      return DenominationsCollection.where({
        currencyCode: code,
        type: 'coin'
      })
    },

    deleteAll: function() {
      this.models.forEach(function(model) {
        model.destroy()
      })

      this.reset()
    },

    denominations: function(code, range) {
      return DenominationsCollection.where({
        currencyCode: code
      }).filter(function(denomination) {
        if (range === undefined) {
          range = denomination.currency().get('range')
        }
        return (denomination.get('value') >= range[0] &&
                denomination.get('value') <= range[1])
      })
    },

    notes: function(code, range) {
      return DenominationsCollection.where({
        currencyCode: code,
        type: 'notes'
      })
    }
  })

  return new CurrenciesCollection()
})
