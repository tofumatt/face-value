'use strict'

casper.test.comment 'Currency Conversion'

casper.start casper.TEST_URL

casper.waitForSelector '.note', ->
  casper.test.info 'Changing home currency to JPY'

  @click '#home-select .JPY-flag a'

casper.then ->
  casper.test.info 'Testing decimal handling'

  @test.assertEval ->
    !$('#notes .denomination .subtitle').text().match /\./
  , 'Japanese Yen output should never contain decimals'

casper.run ->
  @test.done()
