'use strict';

define([
  'app',
  'zepto',
  'underscore',
  'backbone',
  'collections/currencies',
  'models/currency',
  'views/denominations',
  'text!templates/currencies/controls.ejs',
  'text!templates/currencies/list_item.ejs'
], function(App, $, _, Backbone, Currencies, Currency, DenominationView, controlsTemplate, listItemTemplate) {
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

  var Denominations = Backbone.View.extend({
    el: '#denominations',
    $el: $('#denominations'),
    model: Currency,

    initialize: function() {
      _(this).bindAll('addDenomination')

      this.model.on('change', this.render, this)

      this.denominationViews = {}
      Currencies.denominations(this.model.get('code')).forEach(this.addDenomination)
    },

    render: function() {
      _.values(this.denominationViews).forEach(function(view) {
        view.render()
      })
    },

    addDenomination: function(denomination) {
      this.denominationViews[denomination.get('id')] = new DenominationView({
        model: denomination
      })
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
    Denominations: Denominations,
    ListItem: ListItemView
  }
})
