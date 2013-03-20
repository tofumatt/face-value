/*global describe:true it:true */
/*jshint expr:true, sub:true */
'use strict';

require(__dirname + '/../lib/string.js')
var assert = require('should')
var conf = require('nconfs').load(__dirname + '/../')
var fs = require('fs')
var denominations = JSON.parse(fs.readFileSync('./www/denominations.json', 'utf8'))

describe('Each denomination', function() {
  describe('has a flag',  function() {
    // We test to make sure regular images aren't being erroneously supplied,
    // as we simply ship with only retina images and scale them down in-browser.
    // Because of Appcache limitations (unused retina images will be downloaded
    // regardless of device), we simply ship the best images and let the
    // browser handle it.
    it('should not exist in regular header form (retina is scaled)', function(done) {
      for (var i in denominations) {
        if (denominations.hasOwnProperty(i)) {
          fs.readdirSync('{0}/../www/img/header-flags'.format([__dirname]))
            .indexOf('{0}.png'.format([i]))
            .should.equal(-1)
        }
      }

      done()
    })

    it('should have a retina header flag (used for both retina and non-retina)', function(done) {
      for (var i in denominations) {
        if (denominations.hasOwnProperty(i)) {
          fs.statSync('{0}/../www/img/header-flags/{1}@2x.png'.format([__dirname, i]))
            .should.be.ok
        }
      }

      done()
    })

    it('should have a mini flag for the currency selection list', function(done) {
      for (var i in denominations) {
        if (denominations.hasOwnProperty(i)) {
          fs.statSync('{0}/../www/img/flags/{1}@2x.png'.format([__dirname, i]))
            .should.be.ok
        }
      }

      done()
    })

    // Done using weird indexOf because some filesystems (eg HFS+ on
    // Mac OS X) are case-insensitive and will report usd.png as existing.
    it('should be in uppercase, not lowercase', function(done) {
      fs.readdirSync('{0}/../www/img/flags'.format([__dirname])).indexOf('USD.png')
        .should.be.ok

      fs.readdirSync('{0}/../www/img/flags'.format([__dirname])).indexOf('usd.png')
        .should.equal(-1)

      done()
    })
  })
})
