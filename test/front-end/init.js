/*global $:true, casper:true, document:true */
'use strict';

casper.test.comment('Pre-test setup')

casper.start('http://localhost:3001/', function () {
  casper.test.info('Clearing out localStorage')

  this.evaluate(function() {
    window.localStorage.clear()
  })
}).run(function () {
  this.test.done()
})
