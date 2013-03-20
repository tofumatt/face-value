'use strict'

assert = require 'should'
fs = require 'fs'
denominations = JSON.parse fs.readFileSync('./www/denominations.json', 'utf8')

describe 'Each denomination', ->
  describe 'has a flag that', ->
    # We test to make sure regular images aren't being erroneously supplied,
    # as we simply ship with only retina images and scale them down in-browser.
    # Because of Appcache limitations (unused retina images will be downloaded
    # regardless of device), we simply ship the best images and let the
    # browser handle it.
    it 'should not exist in regular header form (retina is scaled)', (done) ->
      for i in denominations
        fs.readdirSync("#{__dirname}/../www/img/header-flags")
          .indexOf("#{i}.png").should.equal -1

      done()

    it 'should have a retina header flag (used for both retina and non-retina)', (done) ->
      for i in denominations
        fs.statSync("#{__dirname}/../www/img/header-flags/#{i}@2x.png")
          .should.be.ok

      done()

    it 'should have a mini flag for the currency selection list', (done) ->
      for i in denominations
        fs.statSync("#{__dirname}/../www/img/flags/#{i}@2x.png")
          .should.be.ok

      done()

    # Done using weird indexOf because some filesystems (eg HFS+ on
    # Mac OS X) are case-insensitive and will report usd.png as existing.
    it 'should be in uppercase, not lowercase', (done) ->
      fs.readdirSync("#{__dirname}/../www/img/flags").indexOf('USD@2x.png')
        .should.be.ok

      fs.readdirSync("#{__dirname}/../www/img/flags").indexOf('usd@2x.png')
        .should.equal -1

      done()
