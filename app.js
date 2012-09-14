'use strict';

var express = require('express')
var app = express.createServer()
var redis = require('redis').createClient()
// var client = redis.createClient();
var conf = require('nconfs').load()
var settings = require('./settings')(app, conf, module.exports, express)

// If redis is enabled, create a client connection.
if (conf.get('redis')) {
  redis.select(conf.get('redis'), function(errDb, res) {
    // app.set('redis', redis)
    console.log(process.env.NODE_ENV || 'dev' + ' database connection status: ', res)
  })
}

app.listen(conf.get('port'))
console.log('Listening on port ' + conf.get('port'))

// Actual app page, used to serve up the app's content.
app.get('/', function(req, res) {
  // Send all data from redis.
  redis.get('denominations', function(err, results) {
    // Template context; put any variables you want to access in your template
    // in this object.
    var context = {
      currencies: JSON.parse(results),
      title: undefined
    }

    // Render the index template and send it to the browser.
    res.render('app', context)
  })
})

// Return all current denomination data in JSON format. This data should be
// locally cached by any app using it.
app.get('/denominations.json', function(req, res) {
  // Send all data from redis.
  redis.get('denominations', function(err, results) {
    res.json(JSON.parse(results))
  })
})

exports.app = app
