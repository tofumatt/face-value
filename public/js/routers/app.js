'use strict';

define([
  'zepto',
  'backbone',
  'app',
  'collections/denominations',
  'views/app'
], function($, Backbone, App, Denominations, AppView) {
  var AppRouter = Backbone.Router.extend({
    routes:{
      'convert/:foreignCurrency-:homeCurrency': 'convert',
      '': 'index'
    },

    initialize: function() {
      return this
    },

    convert: function(foreignCurrency, homeCurrency) {
      // Initialize the application view
      var view = new AppView({
        foreignCurrency: foreignCurrency,
        homeCurrency: homeCurrency
      })
    },

    index: function() {
      this.navigate('convert/{foreign}-{home}'.format({
        foreign: App.get('foreignCurrency'),
        home: App.get('homeCurrency')
      }), {trigger: true})
    }
  })

  return AppRouter
})
