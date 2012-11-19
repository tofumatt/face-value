'use strict';

define([
  'app',
  'zepto',
  'underscore',
  'backbone',
  'collections/currencies',
  'models/denomination',
  'text!templates/denominations/show.ejs'
], function(App, $, _, Backbone, Currencies, Denomination, showTemplate) {
  var ShowView = Backbone.View.extend({
    className: 'denomination col span_1',
    model: Denomination,
    template: _.template(showTemplate),

    // The DOM events specific to an item.
    events: {
    },

    initialize: function() {
      this.model.on('change', this.render, this)
    },

    render: function() {
      this.$el.html(this.template({
        currency: this.model.currency(),
        denomination: this.model,
        homeCurrency: Currencies.where({code: App.get('homeCurrency')})[0]
      }))

      return this
    }
  })

  return ShowView
})
