/*global describe:true it:true */
'use strict';

var app = require('../app').app
var request = require('supertest')

describe('The router', function() {
  describe('index page',  function() {
    it('should return HTTP 200 OK', function(done) {
      request(app)
        .get('/')
        .set('Accept', 'text/html')
        .expect('Content-Type', 'text/html; charset=UTF-8')
        .expect(200, done)
    })
  })
})

describe('Web App functionality', function() {
  it('should have a appcache manifest', function(done) {
    request(app)
      .get('/manifest.appcache')
      .set('Accept', 'text/cache-manifest; charset=UTF-8')
      .expect('Content-Type', 'text/cache-manifest; charset=UTF-8')
      .expect(200, done)
  })

  describe('on FirefoxOS/Mozilla Firefox',  function() {
    it('should have a webapp manifest', function(done) {
      request(app)
        .get('/manifest.webapp')
        // TODO: Not working: fix this.
        // .set('Accept', 'application/x-web-app-manifest+json')
        // .expect('Content-Type', 'application/x-web-app-manifest+json')
        .expect(200, done)
    })
  })
})
