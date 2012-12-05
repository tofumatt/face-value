/*global $:true, casper:true, document:true */
'use strict';

casper.test.comment('Face Value - Homepage')

var originalURL

casper.start('http://localhost:3001/', function () {
  casper.test.info('Testing main app page')

  this.test.assertTitle('Face Value', 'Homepage has the correct title')

  // this.test.assertEval(function() {
  //   return $('html').attr('manifest') === undefined
  // }, 'Appcache manifest should not be present in test environment')
})

casper.waitForSelector('.note', function() {
  casper.test.info('Testing denominations loaded on first run')

  this.test.assert(this.getCurrentUrl() === 'http://localhost:3001/#convert/EUR-USD',
                   'EUR and USD are the default currencies')

  this.test.assertEval(function() {
    return $('.coin').length > 0
  }, 'Euros should display coins by default')
  this.test.assertEval(function() {
    return $('.note').length > 0
  }, 'Euros should display notes by default')
})

casper.then(function() {
  casper.test.info('Testing currency selection list')

  this.test.assertEval(function() {
    return $('#home-select .USD-flag').length === 1
  }, 'Home currency appears in currency selection list even when active')

  this.test.assertEval(function() {
    return $('#foreign-select .THB-flag').length === 1
  }, 'Thai Baht appears in currency selection list when inactive')

  this.test.assertEval(function() {
    return $('#foreign-select .USD-flag').length === 1
  }, 'Home currency appears in foreign selection list')

  this.test.assertEval(function() {
    return $('#home-select .USD-flag a').attr('href') === '#/convert/EUR-USD'
  }, 'Home currency in home selection list links to current URL')

  this.test.assertEval(function() {
    return $('#foreign-select .USD-flag a').attr('href') === '#/convert/USD-EUR'
  }, 'Home currency in foreign selection list links to inverse of current conversion')
})

casper.then(function() {
  originalURL = this.getCurrentUrl()

  casper.test.info('Testing currency switcher')

  this.click('#currency-switcher')
})

casper.waitForSelector('#header.USD-flag', function() {
  this.test.assert(originalURL !== this.getCurrentUrl(),
                   'URL should change after swapping currencies')

  this.test.assertEval(function() {
    return $('.coin').length > 0
  }, 'USD should display coins by default')
  this.test.assertEval(function() {
    return $('.note').length > 0
  }, 'USD should display notes by default')
})

casper.run(function () {
  this.test.done()
})
