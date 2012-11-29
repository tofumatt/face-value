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
  'text!templates/app/header.ejs'
], function($, _, Backbone, App, Currencies, Denominations, CurrencyView, DenominationView, headerTemplate) {
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
          Currencies.denominations(App.get('foreignCurrency'))
                    .forEach(function(denomination) {
                      view.addOne(denomination)
                    })
        }
      })

      return this
    },

    addOne: function(denomination) {
      var view = new DenominationView({
        model: denomination
      })
      $('#{type}s .denomination-list'.format({type: denomination.get('type')})).append(view.render().el)

      // This is some CSS magic snagged from @potch and the Gaia.
      var valueText = view.$el.find('.inner')[0]
      var valWidth = valueText.offsetWidth;
      var maxWidth = valueText.parentNode.offsetWidth;
      var scaleFactor = Math.min(1, (maxWidth - 25) / valWidth);
      valueText.style.transform = 'translate(-50%, -50%) scale(' + scaleFactor + ')';
      valueText.style.MozTransform = 'translate(-50%, -50%) scale(' + scaleFactor + ')';
      valueText.style.WebkitTransform = 'translate(-50%, -50%) scale(' + scaleFactor + ')';
    },

    removeAllDenominations: function(currency) {
      $('.denomination').remove()
    },

    addToCurrencySelectors: function(currency) {
      var foreignCurrency = Currencies.where({code: App.get('foreignCurrency')})[0]
      var homeCurrency = Currencies.where({code: App.get('homeCurrency')})[0]

      // Add this currency to the foreign selector.
      var foreignView = new CurrencyView.ListItem({
        currencies: {
          first: currency,
          second: homeCurrency.get('code') === currency.get('code') ? foreignCurrency : homeCurrency
        },
        model: currency
      })

      $('#foreign-select ul').append(foreignView.render().el)

      // Add this currency to the home selector.
      var homeView = new CurrencyView.ListItem({
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

      this.controls = new CurrencyView.Controls({
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
    template: _.template(headerTemplate),

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
