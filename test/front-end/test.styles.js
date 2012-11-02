/*global $:true, casper:true, document:true */
'use strict';

casper.test.comment('Face Value - Styles')

casper.start('http://localhost:3001/#convert/EUR-USD', function () {
  casper.test.info('Testing styles')
})

casper.waitForSelector('#currency-selector', function() {
  this.test.assertEval(function() {
    return $('#currency-selector').height() === 48
  }, 'Currency selector should be 38px tall by default')

  this.test.assertEval(function() {
    $('#currency-selector').html('')
    return $('#currency-selector').height() === 48
  }, 'Currency selector should be 38px tall with no content')
})

casper.run(function () {
  this.test.done()
})
