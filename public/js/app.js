/*global _:true, App:true, Backbone:true */
/*jshint forin:false, plusplus:false, sub:true */
'use strict';

define([
  'zepto',
  'collections/currencies',
  'collections/denominations',
  'models/currency',
  'models/denomination'
], function($, CurrenciesCollection, DenominationsCollection, Currency, Denomination) {
  if (!window._faceValueDataCache) {
    window._faceValueDataCache = {}
  }

  var GLOBALS = {
    DEFAULT_FOREIGN_CURRENCY: 'EUR',
    DEFAULT_HOME_CURRENCY: 'USD',
    TIME_TO_UPDATE: 3600
  }

  var dataCache = window._faceValueDataCache

  function initialize(callback) {
    if (window.navigator.userAgent.match(/iPhone|iPod|iPad/i)) {
      $('body').addClass('ios')
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
            if (!get('lastTimeCurrencyDataUpdated') ||
                timestamp() - get('lastTimeCurrencyDataUpdated') > GLOBALS.TIME_TO_UPDATE) {
              fetchCurrencyData(callback)
            } else {
              callback()
            }
          }
        })
      }
    })
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
      url: '/denominations.json',
      dataType: 'json',
      success: function(results) {
        updateCurrencyData(results)

        callback()
      },
      error: function() {
        console.log('failed')
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
        'fraction',
        'fractionSymbol',
        'fractionSymbolAfter',
        'name',
        'pluralName',
        'range',
        'whole',
        'wholeSymbol',
        'wholeSymbolAfter',
        'worth'
      ))

      // console.log(i, currencyData[i])
      // console.log(currency.toJSON())

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
