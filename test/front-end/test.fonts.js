/*global $:true, casper:true, document:true */
'use strict';

casper.test.comment('Face Value - Fonts')

casper.start('http://localhost:3001/', function () {
  casper.test.info('Testing for Bitter fonts')
})

casper.waitForResource('Bitter-Regular-webfont.ttf', function() {
  this.test.assertResourceExists('Bitter-Regular-webfont.ttf',
                                 'Bitter font loaded properly')
})

casper.waitForResource('Bitter-Bold-webfont.ttf', function() {
  this.test.assertResourceExists('Bitter-Bold-webfont.ttf',
                                 'Bitter Bold font loaded properly')
})

casper.waitForResource('Bitter-Italic-webfont.ttf', function() {
  this.test.assertResourceExists('Bitter-Italic-webfont.ttf',
                                 'Bitter Italic font loaded properly')
})

casper.run(function () {
  this.test.done()
})
