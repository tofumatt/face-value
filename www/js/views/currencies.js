'use strict';

define([
  'app',
  'zepto',
  'underscore',
  'backbone',
  'collections/currencies',
  'models/currency',
  'text!templates/currencies/controls.ejs',
  'text!templates/currencies/list_item.ejs'
], function(App, $, _, Backbone, Currencies, Currency, controlsTemplate, listItemTemplate) {
  var ControlsView = Backbone.View.extend({
    el: '#controls',
    $el: $('#controls'),
    tagName: 'div',
    template: _.template(controlsTemplate),

    // The DOM events specific to an item.
    events: {
      'click .select-currency': 'selectCurrency'
    },

    initialize: function() {
      $('.currency-list-selector').on('click', this.closeSelection)

      this.render()
    },

    render: function() {
      this.$el.html(this.template({
        foreignCurrency: this.options.currencies.foreign,
        homeCurrency: this.options.currencies.home
      }))

      return this
    },

    closeSelection: function(event) {
      // Don't close the selection div if the user actually clicked on a
      // currency link in the list.
      var targetElement = event.originalTarget || event.target

      if (!$(targetElement).hasClass('change-currency')) {
        $('.currency-list-selector').addClass('hide')

        event.preventDefault()
      }
    },

    selectCurrency: function(event) {
      $('#{currency}-select'.format({
        currency: $(event.target).data('currency')
      })).removeClass('hide')

      event.preventDefault()
    }
  })

  var ListItemView = Backbone.View.extend({
    model: Currency,
    tagName: 'li',
    template: _.template(listItemTemplate),

    // The DOM events specific to an item.
    events: {
      'click .change-currency': 'changeCurrency'
    },

    attributes: function() {
      return {
        'class': 'flag {code}-flag'.format({code: this.model.get('code')}),
        'data-currency': this.model.get('code')
      }
    },

    initialize: function() {
      
    },

    render: function() {
      this.$el.html(this.template({
        currency: this.model,
        first: this.options.currencies.first,
        second: this.options.currencies.second
      }))

      return this
    },

    changeCurrency: function(event) {
      $('.currency-list-selector').addClass('hide')
    }
  })

  return {
    Controls: ControlsView,
    ListItem: ListItemView
  }
})
