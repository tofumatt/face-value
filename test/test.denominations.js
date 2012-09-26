/*global describe:true it:true */
/*jshint expr:true */
'use strict';

require(__dirname + '/../lib/string.js')
var assert = require('should')
var conf = require('nconfs').load()
var fs = require('fs')
var denominations = JSON.parse(fs.readFileSync('./lib/denominations.json', 'utf8'))
// var redis = process.env.REDISTOGO_URL ? require('redis-url').connect(process.env.REDISTOGO_URL) : require('redis').createClient()
// var scraper = require(__dirname + '/../script/scraper.js')

// If redis is enabled, create a client connection.
// if (conf.get('redis')) {
//   redis.select(process.env.REDISTOGO_URL || conf.get('redis'), function(errDb, res) {
//     console.log((process.env.NODE_ENV || 'development') + ' database connection status: ', res)
//   })
// }

// Get denominations first.
// redis.get('denominations', function(err, results) {
  // var denominations = JSON.parse(results)

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
// })
