'use strict';

define([
  'underscore',
  'backbone',
  'backbone_store',
  'models/denomination'
], function(_, Backbone, Store, Denomination) {
  var DenominationsCollection = Backbone.Collection.extend({
    model: Denomination,

    localStorage: new Store('Denominations'),

    comparator: function(denomination) {
      return denomination.get('value')
    },

    deleteAll: function() {
      this.models.forEach(function(model) {
        model.destroy()
      })

      this.reset()
    }
  })

  return new DenominationsCollection()
})
