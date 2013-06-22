'use strict';

define([
  'zepto',
  'underscore',
  'backbone',
  'app',
  'collections/currencies',
  'collections/denominations',
  'views/currencies',
  'views/denominations',
  'tpl!templates/app/header.ejs'
], function($, _, Backbone, App, Currencies, Denominations, CurrencyViews, DenominationView, headerTemplate) {
  var AppView = Backbone.View.extend({
    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: '#denominations',
    $el: $('#denominations'),

    events: {
    },

    initialize: function() {
      App.set('homeCurrency', this.options.homeCurrency)
      App.set('foreignCurrency', this.options.foreignCurrency)

      this.header = new HeaderView()

      this.render()
    },

    render: function() {
      var view = this

      this.header.render()
      this.renderControls()
      this.removeAllDenominations()

      Denominations.fetch({
        success: function() {
          var view = new CurrencyViews.Denominations({
            model: Currencies.where({code: App.get('foreignCurrency')})[0]
          })
        }
      })

      return this
    },

    removeAllDenominations: function(currency) {
      $('.denomination').remove()
    },

    addToCurrencySelectors: function(currency) {
      var foreignCurrency = Currencies.where({code: App.get('foreignCurrency')})[0]
      var homeCurrency = Currencies.where({code: App.get('homeCurrency')})[0]

      // Add this currency to the foreign selector.
      var foreignView = new CurrencyViews.ListItem({
        currencies: {
          first: currency,
          second: homeCurrency.get('code') === currency.get('code') ? foreignCurrency : homeCurrency
        },
        model: currency
      })

      $('#foreign-select ul').append(foreignView.render().el)

      // Add this currency to the home selector.
      var homeView = new CurrencyViews.ListItem({
        currencies: {
          first: foreignCurrency.get('code') === currency.get('code') ? homeCurrency : foreignCurrency,
          second: currency
        },
        model: currency
      })

      $('#home-select ul').append(homeView.render().el)
    },

    renderControls: function() {
      $('.currency-list-selector li').remove()

      this.controls = new CurrencyViews.Controls({
        currencies: {
          foreign: Currencies.where({code: App.get('foreignCurrency')})[0],
          home: Currencies.where({code: App.get('homeCurrency')})[0]
        }
      })

      var view = this
      Currencies.fetch({
        success: function(results) {
          results.forEach(function(c) {
            view.addToCurrencySelectors(c)
          })
        }
      })
    }
  })

  var HeaderView = Backbone.View.extend({
    el: '#header',
    $el: $('#header'),
    tagName: 'div',
    template: headerTemplate,

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
        foreignCurrency: Currencies.where({code: App.get('foreignCurrency')})[0],
        homeCurrency: Currencies.where({code: App.get('homeCurrency')})[0]
      })).removeClass().addClass('{code}-flag'.format({
        code: Currencies.where({code: App.get('foreignCurrency')})[0].get('code')
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

  return {
    AppView: AppView,
    HeaderView: HeaderView
  }
})
