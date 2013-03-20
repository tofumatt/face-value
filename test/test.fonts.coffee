'use strict'

casper.test.comment 'Fonts'

casper.start casper.TEST_URL, ->
  casper.test.info 'Testing for Bitter fonts'

casper.waitForSelector '.note'

casper.then ->
  @test.assertEval ->
    $('body').css('font-family').match(/^Bitter/g) != null
  , '<body> font should be Bitter'

casper.run ->
  @test.done()
