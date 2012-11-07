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
  var controlsView = Backbone.View.extend({
    el: '#header',
    $el: $('#header'),
    model: Currency,
    tagName: 'div',
    template: _.template(controlsTemplate),

    // The DOM events specific to an item.
    events: {
      'click .select-currency': 'selectCurrency'
    },

    initialize: function() {
      $('.currency-list-selector').on('click', this.closeSelection)

      this.model.on('change', this.render, this)
      this.render()
    },

    render: function() {
      this.$el.html(this.template({
        currency: this.model,
        homeCurrency: Currencies.where({code: App.get('homeCurrency')})[0]
      })).removeClass().addClass('{code}-flag'.format({code: this.model.get('code')}))

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

  var listItemView = Backbone.View.extend({
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
      this.model.on('change', this.render, this)
    },

    render: function() {
      this.$el.html(this.template({
        currency: this.model,
        homeCurrency: Currencies.where({code: App.get('homeCurrency')})[0]
      }))

      return this
    },

    changeCurrency: function(event) {
      $('.currency-list-selector').addClass('hide')
    }
  })

  return {
    controls: controlsView,
    listItem: listItemView
  }
})
