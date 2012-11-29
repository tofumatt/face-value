/*global $:true, casper:true, document:true */
'use strict';

casper.test.comment('Face Value - Currency Conversion')

casper.start('http://localhost:3001/', function () {
})

casper.waitForSelector('.note', function() {
  casper.test.info('Changing home currency to JPY')

  this.click('#home-select .JPY-flag a')
})

casper.then(function() {
  casper.test.info('Testing decimal handling')

  this.test.assertEval(function() {
    return !$('#notes .denomination .subtitle').text().match(/\./)
  }, 'Japanese Yen output should never contain decimals')
})

casper.run(function () {
  this.test.done()
})
