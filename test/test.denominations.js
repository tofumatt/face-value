/*global describe:true it:true */
/*jshint expr:true, sub:true */
'use strict';

require(__dirname + '/../lib/string.js')
var assert = require('should')
var conf = require('nconfs').load(__dirname + '/../')
var fs = require('fs')
var denominations = JSON.parse(fs.readFileSync('./public/denominations.json', 'utf8'))

describe('Each denomination', function() {
  describe('has a flag',  function() {
    it('should exist in regular header form', function(done) {
      for (var i in denominations) {
        if (denominations.hasOwnProperty(i)) {
          fs.statSync('{0}/../public/img/header-flags/{1}.png'.format([__dirname, i]))
            .should.be.ok
        }
      }

      done()
    })

    it('should have a retina header flag', function(done) {
      for (var i in denominations) {
        if (denominations.hasOwnProperty(i)) {
          fs.statSync('{0}/../public/img/header-flags/{1}@2x.png'.format([__dirname, i]))
            .should.be.ok
        }
      }

      done()
    })

    it('should have a mini flag for the currency selection list', function(done) {
      for (var i in denominations) {
        if (denominations.hasOwnProperty(i)) {
          fs.statSync('{0}/../public/img/flags/{1}.png'.format([__dirname, i]))
            .should.be.ok
        }
      }

      done()
    })

    // Done using weird indexOf because some filesystems (eg HFS+ on
    // Mac OS X) are case-insensitive and will report usd.png as existing.
    it('should be in uppercase, not lowercase', function(done) {
      fs.readdirSync('{0}/../public/img/flags'.format([__dirname])).indexOf('USD.png')
        .should.be.ok

      fs.readdirSync('{0}/../public/img/flags'.format([__dirname])).indexOf('usd.png')
        .should.equal(-1)

      done()
    })
  })
})
