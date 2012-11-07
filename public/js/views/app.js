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
], function($, _, Backbone, App, Currencies, Denominations, CurrencyView, DenominationView) {
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

      this.setupControls()
      this.removeAllDenominations()

      this.render()
    },

    render: function() {
      var view = this

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
      // Add this currency to the foreign selector, as long as it's not the
      // active home currency.
      if (App.get('homeCurrency') !== currency.get('code')) {
        var view = new CurrencyView.listItem({
          active: App.get('foreignCurrency') === currency.get('code'),
          model: currency
        })

        $('#foreign-select ul').append(view.render().el)
      }
    },

    setupControls: function() {
      $('.currency-list-selector li').remove()
      this.controls = new CurrencyView.controls({
        model: Currencies.where({
          code: App.get('foreignCurrency')
        })[0]
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

  return AppView
})
