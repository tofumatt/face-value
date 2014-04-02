/*global _:true, App:true, Backbone:true */
/*jshint forin:false, plusplus:false, sub:true */
'use strict';

define([
  'zepto',
  'currency-data',
  'collections/currencies',
  'collections/denominations',
  'models/currency',
  'models/denomination'
], function($, CurrencyData, CurrenciesCollection, DenominationsCollection, Currency, Denomination) {
  // Create an in-memory cache for various pieces of data.
  if (!window._faceValueDataCache) {
    window._faceValueDataCache = {}
  }

  // Globals accessible via window.GLOBALS.
  var GLOBALS = {
    DEFAULT_FOREIGN_CURRENCY: 'EUR',
    DEFAULT_HOME_CURRENCY: 'USD',
    HAS: {
      nativeScroll: (function() {
        return 'WebkitOverflowScrolling' in window.document.createElement('div').style
      })()
    },
    TIME_TO_UPDATE: 3600 * 24 // Update currencies/denominations every day
  }
  window.GLOBALS = GLOBALS

  var dataCache = window._faceValueDataCache

  function initialize(callback) {
    if (GLOBALS.HAS.nativeScroll) {
      $('body').addClass('native-scroll')
    }

    if (window.cordova) {
      window.document.addEventListener('deviceready', cordovaPrep)
    }

    // TODO: Improve this.
    // This is a hacky cache-bust thing while I figure out a better way...
    cacheReady()

    // OMG, this is how we cache bust for now.
    window.applicationCache.addEventListener('cached', function() {
      cacheReady()
      window.location.reload()
    })

    window.applicationCache.addEventListener('updateready', function() {
      cacheReady()
      window.location.reload()
    })

    if (get('cacheReady')) {
      $('body').removeClass('cache-loading')
    } else {
      $('#loading-text').animate({opacity: 1})
    }

    CurrenciesCollection.fetch({
      success: function() {
        DenominationsCollection.fetch({
          success: function() {
            if (!get('foreignCurrency')) {
              set('foreignCurrency', GLOBALS.DEFAULT_FOREIGN_CURRENCY)
            }

            if (!get('homeCurrency')) {
              set('homeCurrency', GLOBALS.DEFAULT_HOME_CURRENCY)
            }

            // Update currency/denomination info every hour.
            if (!get('lastTimeCurrencyDataUpdated')) {
              CurrencyData.update(function(worth) {
                set('worth', worth)

                fetchCurrencyData(callback)
              })
            } else {
              callback()

              if (timestamp() - get('lastTimeCurrencyDataUpdated') > GLOBALS.TIME_TO_UPDATE) {
                CurrencyData.update(function(worth) {
                  set('worth', worth)

                  fetchCurrencyData()
                })
              }
            }
          }
        })
      }
    })
  }

  function cacheReady() {
    $('body').removeClass('cache-loading')
    set('cacheReady', true)
  }

  function cordovaPrep() {
    if (window.device && window.device.platform === 'iOS') {
      if (parseFloat(window.device.version, 10) >= 7.0) {
        $('body').addClass('ios7')
      } else {
        $('body').addClass('ios-classic')
      }
    }
  }

  function get(key, fallback) {
    if (dataCache[key] !== undefined) {
      // console.info('cache hit', '### ' + key + ' ###', dataCache[key])
      return dataCache[key]
    } else if (window.localStorage[key] !== undefined) {
      dataCache[key] = JSON.parse(window.localStorage[key])
      // console.info('cache miss', '### ' + key + ' ###', dataCache[key])
      return dataCache[key]
    } else {
      // console.info('not found')
      return fallback
    }
  }

  function fetchCurrencyData(callback) {
    $.ajax({
      url: 'denominations.json',
      dataType: 'json',
      success: function(results) {
        updateCurrencyData(results)

        if (callback) {
          callback()
        }
      },
      // We're likely offline, so we won't try to update the currency data,
      // and instead just load whatever data we currency have.
      error: function() {
        // TODO: Implement me.
      }
    })
  }

  function set(key, value) {
    window.localStorage[key] = JSON.stringify(value)
    return dataCache[key] = value
  }

  function timestamp(date) {
    if (!date) {
      date = new Date()
    }

    return Math.round(date.getTime() / 1000)
  }

  function updateCurrencyData(currencyData) {
    for (var i in currencyData) {
      var currency = CurrenciesCollection.where({code: i})[0];

      // This currency doesn't exist yet, so we'll create it.
      if (!currency) {
        currency = new Currency({code: i})
        CurrenciesCollection.add(currency)
      }

      currency.set(_.pick(currencyData[i],
        'dontUseFraction',
        'fraction',
        'fractionSymbol',
        'fractionSymbolAfter',
        'name',
        'pluralName',
        'range',
        'whole',
        'wholeSymbol',
        'wholeSymbolAfter'
      ))

      currency.set({
        worth: get('worth')[i]
      })

      currency.save()
    }

    // Update/create denomination data.
    CurrenciesCollection.each(function(model) {
      _(['coins', 'notes']).each(function(type) {
        for (var i in currencyData[model.get('code')][type]) {
          var denomination = DenominationsCollection.where({
            currencyCode: model.get('code'),
            value: parseFloat(_.keys(currencyData[model.get('code')][type][i])[0]),
            type: type.slice(0, -1)
          })[0];

          // No denomination with these properties exists, so it's new.
          if (!denomination) {
            denomination = new Denomination({
              currencyCode: model.get('code'),
              style: _.values(currencyData[model.get('code')][type][i])[0],
              type: type.slice(0, -1),
              value: parseFloat(_.keys(currencyData[model.get('code')][type][i])[0]),
            })

            DenominationsCollection.add(denomination)
          } else {
            denomination.set({
              style: _.values(currencyData[model.get('code')][type][i])[0]
            })
          }

          denomination.save()
        }
      })
    })

    set('lastTimeCurrencyDataUpdated', timestamp())
  }

  return _(GLOBALS).extend({
    get: get,
    initialize: initialize,
    set: set,
    timestamp: timestamp,
    updateCurrencyData: updateCurrencyData
  })
})
