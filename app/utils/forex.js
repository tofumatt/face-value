import Ember from 'ember';

var $ = Ember.$;

export default function forex() {
  var FINANCE_URL = 'http://finance.yahoo.com/webservice/v1/symbols/allcurrencies/quote?format=json&callback=?';
  var REFERENCE_CURRENCY = 'USD';
  var worth = {};
  worth[REFERENCE_CURRENCY] = 1;

  function getCurrencyName(currency) {
    return currency.resource.fields.name.split('/')[1];
  }

  function getCurrencyWorth(currency) {
    return parseFloat(currency.resource.fields.price);
  }

  function update(callback) {
    $.ajax({
      dataType: 'jsonp',
      url: FINANCE_URL,
      success: function(currencies) {
        currencies.list.resources.forEach(function(c) {
          if (getCurrencyName(c)) {
            worth[getCurrencyName(c)] = getCurrencyWorth(c);
          }
        });

        callback(worth);
      }
    });
  }

  return {
    REFERENCE_CURRENCY: REFERENCE_CURRENCY,
    update: update
  };
}
