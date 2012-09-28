/*global describe:true, it:true */
/*jshint expr:true, sub:true */
'use strict';

require(__dirname + '/../lib/string.js')
var assert = require('should')
var conf = require('nconfs').load(__dirname + '/../')
var exec = require('child_process').exec;
var fs = require('fs')
var redis = require('redis').createClient()

redis.select(conf.get('redis'))

var denominations = JSON.parse(fs.readFileSync('./lib/denominations.json', 'utf8'))
for (var i in denominations) {
  if (denominations.hasOwnProperty(i) &&
    i !== 'CAD' && i !== 'THB' && i !== 'USD') {
      delete denominations[i]
  }
}

describe('The scraper', function() {
  it('should save results to redis', function(done) {
    this.timeout(10000)
    exec('NODE_ENV=test make update_currencies', function() {
      redis.get('denominations', function(err, results) {
        var redisDenominations = JSON.parse(results)

        assert(Object.keys(redisDenominations).length === Object.keys(denominations).length)

        done()
      })
    })
  })

  it('should contain exchange rates', function(done) {
    redis.get('denominations', function(err, results) {
      var redisDenominations = JSON.parse(results)

      Object.keys(redisDenominations['USD']['worth']).length.should.be.ok

      done()
    })
  })
})
