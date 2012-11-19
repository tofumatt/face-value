'use strict';

define([
  'underscore',
  'backbone',
  'collections/denominations'
], function(_, Backbone, DenominationsCollection) {
  var CurrencyModel = Backbone.Model.extend({
    defaults: {
      code: '???',
      coins: [],
      fraction: 'cent',
      fractionSymbol: '¢',
      fractionSymbolAfter: true,
      name: 'Unknown Dollar',
      notes: [],
      pluralName: "Unknown Dollars",
      range: null,
      whole: 'dollar',
      wholeSymbol: '$',
      wholeSymbolAfter: false,
      worth: undefined
    },

    coins: function() {
      return DenominationsCollection.where({
        code: this.model.get('code'),
        type: 'coin'
      })
    },

    notes: function() {
      return DenominationsCollection.where({
        code: this.model.get('code'),
        type: 'note'
      })
    }
  })

  return CurrencyModel
})
