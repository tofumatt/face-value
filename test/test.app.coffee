'use strict'

casper.test.comment 'Main page and app logic'

originalURL = ''

casper.start casper.TEST_URL, ->
  casper.test.info 'Testing main app page'

  @test.assertTitle 'Face Value', 'Page has the correct title'

casper.waitForSelector '.note', ->
  casper.test.info 'Testing denominations loaded on first run'

  @test.assert @getCurrentUrl() == casper.TEST_URL + '#convert/EUR-USD',
    'EUR and USD are the default currencies'

  @test.assertEval ->
    $('.coin').length > 0
  , 'Euros should display coins by default'

  @test.assertEval ->
    $('.note').length > 0
  , 'Euros should display notes by default'

casper.then ->
  casper.test.info 'Testing currency selection list'

  @test.assertEval ->
    $('#home-select .USD-flag').length == 1
  , 'Home currency appears in currency selection list even when active'

  @test.assertEval ->
    $('#foreign-select .THB-flag').length == 1
  , 'Thai Baht appears in currency selection list when inactive'

  @test.assertEval ->
    $('#foreign-select .USD-flag').length == 1
  , 'Home currency appears in foreign selection list'

  @test.assertEval ->
    $('#home-select .USD-flag a').attr('href') == '#/convert/EUR-USD'
  , 'Home currency in home selection list links to current URL'

  @test.assertEval ->
    $('#foreign-select .USD-flag a').attr('href') == '#/convert/USD-EUR'
  , 'Home currency in foreign selection list links to inverse of current conversion'

casper.then ->
  originalURL = @getCurrentUrl()

  casper.test.info 'Testing currency switcher'

  @click '#currency-switcher'

casper.waitForSelector '#header.USD-flag', ->
  @test.assert originalURL != @getCurrentUrl(),
    'URL should change after swapping currencies'

  @test.assertEval ->
    $('.coin').length > 0
  , 'USD should display coins by default'

  @test.assertEval ->
    $('.note').length > 0
  , 'USD should display notes by default'

casper.run ->
  @test.done()
