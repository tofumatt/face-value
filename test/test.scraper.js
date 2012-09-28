/*global describe:true, it:true */
'use strict';

require(__dirname + '/../lib/string.js')
var conf = require('nconfs').load(__dirname + '/../')
var exec = require('child_process').exec;
var fs = require('fs')
var redis = require('redis').createClient()

redis.select(conf.get('redis'), function(errDb, res) {
  console.log(process.env.NODE_ENV || 'dev' + ' database connection status: ', res)
})

var denominations = JSON.parse(fs.readFileSync('./lib/denominations.json', 'utf8'))
for (var i in denominations) {
  if (denominations.hasOwnProperty(i) &&
    i !== 'CAD' && i !== 'THB' && i !== 'USD') {
      delete denominations[i]
  }
}

describe('The scraper', function() {
  it('should return HTTP 200 OK', function(done) {
    this.timeout(10000)
    exec('NODE_ENV=test make update_currencies', function() {
      redis.get('denominations', function(err, results) {
        var redisDenominations = JSON.parse(results)
        for (var i in redisDenominations) {
          if (redisDenominations.hasOwnProperty(i) &&
            i !== 'CAD' && i !== 'THB' && i !== 'USD') {
              delete redisDenominations[i]
          }
        }

        Object.keys(redisDenominations).length === Object.keys(denominations).length

        done()
      })
    })
  })
})
