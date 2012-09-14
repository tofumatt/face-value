'use strict';

var FINANCE_URL = 'http://download.finance.yahoo.com/d/quotes.csv?e=.csv&f=sl1d1t1&s={0}{1}=X'

require(__dirname + '/../lib/string.js')
var conf = require('nconfs').load(__dirname + '/../')
var fs = require('fs')
var redis = require('redis').createClient()
var rest = require('restler')

var denominations = JSON.parse(fs.readFileSync('./lib/denominations.json', 'utf8'))

redis.select(conf.get('redis'), function(errDb, res) {
  console.log(process.env.NODE_ENV || 'dev' + ' database connection status: ', res)
})

var denominationsCollected = 0

function getCurrencies(string) {
  return [string.substr(0, 3), string.substr(3, 3)]
}

function updateCurrency(result) {
  if (result instanceof Error) {
    console.log('Error: ' + result.message)
    // this.retry(5000) // Try again after 5 seconds if the request failed.
  } else {
    var rate = result.replace('"', '').split(',')
    var currencies = getCurrencies(rate[0])
    console.log('Updating {0} to {1} (rate 1 = {2})'.format([
      currencies[0],
      currencies[1],
      parseFloat(rate[1])
    ]))
    denominations[currencies[0]].worth[currencies[1]] = parseFloat(rate[1])
    denominationsCollected += 1
  }

  // Once we've collected all denomination combinations, save the data to redis
  // and exit.
  if (denominationsCollected === Object.keys(denominations).length * Object.keys(denominations).length - Object.keys(denominations).length) {
    redis.set('denominations', JSON.stringify(denominations))
    redis.end()
  }
}

for (var i in denominations) {
  if (denominations.hasOwnProperty(i)) {
    for (var j in denominations) {
      if (denominations.hasOwnProperty(j) && i !== j) {
        rest.get(FINANCE_URL.format([i, j])).on('complete', updateCurrency)
      }
    }
  }
}
