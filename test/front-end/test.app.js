/*global $:true, casper:true, document:true */
'use strict';

casper.test.comment('Face Value - Homepage')

var originalURL

casper.start('http://localhost:3001/', function () {
  casper.test.info('Testing main app page')

  this.test.assertTitle('Face Value', 'Homepage has the correct title')

  this.test.assertEval(function() {
    return !$('html').attr('manifest')
  }, 'No appcache manifest should be present in test environment')
})

casper.waitForSelector('.notes', function() {
  casper.test.info('Testing denominations loaded on first run')

  this.test.assert(this.getCurrentUrl() === 'http://localhost:3001/#EUR,USD',
                   'EUR and USD are the default currencies')

  this.test.assertEval(function() {
    return $('.coins').length > 0
  }, 'Euros should display coins by default')
  this.test.assertEval(function() {
    return $('.notes').length > 0
  }, 'Euros should display notes by default')
})

casper.then(function() {
  casper.test.info('Testing currency selection list')

  this.test.assertEval(function() {
    return !$('#first-select .USD-flag').length
  }, 'USD does not appear in currency selection list when active')

  this.test.assertEval(function() {
    return $('#first-select .THB-flag').length === 1
  }, 'Thai Baht appears in currency selection list when inactive')
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
    return $('.coins').length === 0
  }, 'USD should display no coins by default')
  this.test.assertEval(function() {
    return $('.notes').length > 0
  }, 'USD should display notes by default')
})

casper.run(function () {
  this.test.done()
})
