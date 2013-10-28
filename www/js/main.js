/*global Backbone:true */
/*!
 Face Value | https://github.com/tofumatt/face-value
*/
'use strict';

// Require.js allows us to configure shortcut alias
require.config({
  paths: {
    async_storage: 'lib/async_storage',
    backbone: 'lib/backbone',
    backbone_store: 'lib/backbone.localforage',
    localforage: 'lib/localforage',
    tpl: 'lib/tpl',
    underscore: 'lib/lodash',
    zepto: 'lib/zepto'
  },
  // The shim config allows us to configure dependencies for
  // scripts that do not call define() to register a module
  shim: {
    'async_storage': {
        exports: 'asyncStorage'
    },
    'backbone': {
      deps: [
        'underscore',
        'zepto'
      ],
      exports: 'Backbone'
    },
    'underscore': {
      exports: '_'
    },
    'zepto': {
      exports: 'Zepto'
    }
  }
})

require([
  'app',
  'routers/app'
], function(App, AppRouter) {
  function init() {
    // Load last used currencies and load them on startup.
    var previousCurrencies = {
      foreign: App.get('foreignCurrency'),
      home: App.get('homeCurrency')
    }

    // Initialize routing and start Backbone.history()
    var router = new AppRouter()

    Backbone.history.start()

    // Navigate to previously used currencies on startup.
    router.navigate('convert/{foreign}-{home}'.format(previousCurrencies), {
      trigger: true
    })
  }

  App.initialize(init)
})
